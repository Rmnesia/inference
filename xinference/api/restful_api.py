# Copyright 2022-2023 XProbe Inc.
#
# Licensed under the Apache License, Version 2.0 (the "License");
# you may not use this file except in compliance with the License.
# You may obtain a copy of the License at
#
#      http://www.apache.org/licenses/LICENSE-2.0
#
# Unless required by applicable law or agreed to in writing, software
# distributed under the License is distributed on an "AS IS" BASIS,
# WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
# See the License for the specific language governing permissions and
# limitations under the License.

import asyncio
import inspect
import json
import logging
import multiprocessing
import os
import pprint
import sys
import time
import warnings
import datetime
import subprocess
from typing import Any
import select
import threading
from typing import Any, Dict, List, Optional, Union

import gradio as gr
import xoscar as xo
from aioprometheus import REGISTRY, MetricsMiddleware
from aioprometheus.asgi.starlette import metrics
from fastapi import (
    APIRouter,
    FastAPI,
    File,
    Form,
    HTTPException,
    Query,
    Request,
    Response,
    Security,
    UploadFile,
)
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse, FileResponse, StreamingResponse
from fastapi.staticfiles import StaticFiles
from PIL import Image
from sse_starlette.sse import EventSourceResponse
from starlette.responses import JSONResponse as StarletteJSONResponse
from starlette.responses import RedirectResponse
from uvicorn import Config, Server
from xoscar.utils import get_next_port

from .._compat import BaseModel, Field
from .._version import get_versions
from ..constants import XINFERENCE_DEFAULT_ENDPOINT_PORT, XINFERENCE_DISABLE_METRICS
from ..core.event import Event, EventCollectorActor, EventType
from ..core.supervisor import SupervisorActor
from ..core.utils import json_dumps
from ..core.dataset import DatasetReader
from ..core.runner import TrainRequest
from ..types import (
    SPECIAL_TOOL_PROMPT,
    ChatCompletion,
    ChatCompletionMessage,
    Completion,
    CreateChatCompletion,
    CreateCompletion,
    ImageList,
    PeftModelConfig,
    max_tokens_field,
)
from .oauth2.auth_service import AuthService
from .oauth2.types import LoginUserForm

logger = logging.getLogger(__name__)


class JSONResponse(StarletteJSONResponse):  # type: ignore # noqa: F811
    def render(self, content: Any) -> bytes:
        return json_dumps(content)


class CreateCompletionRequest(CreateCompletion):
    class Config:
        schema_extra = {
            "example": {
                "prompt": "\n\n### Instructions:\nWhat is the capital of France?\n\n### Response:\n",
                "stop": ["\n", "###"],
            }
        }


class CreateEmbeddingRequest(BaseModel):
    model: str
    input: Union[str, List[str], List[int], List[List[int]]] = Field(
        description="The input to embed."
    )
    user: Optional[str] = None

    class Config:
        schema_extra = {
            "example": {
                "input": "The food was delicious and the waiter...",
            }
        }


class RerankRequest(BaseModel):
    model: str
    query: str
    documents: List[str]
    top_n: Optional[int] = None
    return_documents: Optional[bool] = False
    max_chunks_per_doc: Optional[int] = None


class TextToImageRequest(BaseModel):
    model: str
    prompt: Union[str, List[str]] = Field(description="The input to embed.")
    n: Optional[int] = 1
    response_format: Optional[str] = "url"
    size: Optional[str] = "1024*1024"
    kwargs: Optional[str] = None
    user: Optional[str] = None


class RegisterModelRequest(BaseModel):
    model: str
    persist: bool


class BuildGradioInterfaceRequest(BaseModel):
    model_type: str
    model_name: str
    model_size_in_billions: int
    model_format: str
    quantization: str
    context_length: int
    model_ability: List[str]
    model_description: str
    model_lang: List[str]


class BuildGradioImageInterfaceRequest(BaseModel):
    model_type: str
    model_name: str
    model_family: str
    model_id: str
    controlnet: Union[None, List[Dict[str, Union[str, None]]]]
    model_revision: str

process = None

class RESTfulAPI:
    def __init__(
        self,
        supervisor_address: str,
        host: str,
        port: int,
        auth_config_file: Optional[str] = None,
    ):
        super().__init__()
        self._supervisor_address = supervisor_address
        self._host = host
        self._port = port
        self._supervisor_ref = None
        self._event_collector_ref = None
        self._auth_service = AuthService(auth_config_file)
        self._router = APIRouter()
        self._app = FastAPI()
        self._dataset = DatasetReader()

    def is_authenticated(self):
        return False if self._auth_service.config is None else True

    @staticmethod
    def handle_request_limit_error(e: Exception):
        if "Rate limit reached" in str(e):
            raise HTTPException(status_code=429, detail=str(e))

    async def _get_supervisor_ref(self) -> xo.ActorRefType[SupervisorActor]:
        if self._supervisor_ref is None:
            self._supervisor_ref = await xo.actor_ref(
                address=self._supervisor_address, uid=SupervisorActor.uid()
            )
        return self._supervisor_ref

    async def _get_event_collector_ref(self) -> xo.ActorRefType[EventCollectorActor]:
        if self._event_collector_ref is None:
            self._event_collector_ref = await xo.actor_ref(
                address=self._supervisor_address, uid=EventCollectorActor.uid()
            )
        return self._event_collector_ref

    async def _report_error_event(self, model_uid: str, content: str):
        try:
            event_collector_ref = await self._get_event_collector_ref()
            await event_collector_ref.report_event(
                model_uid,
                Event(
                    event_type=EventType.ERROR,
                    event_ts=int(time.time()),
                    event_content=content,
                ),
            )
        except Exception:
            logger.exception(
                "Report error event failed, model: %s, content: %s", model_uid, content
            )

    async def login_for_access_token(self, request: Request) -> JSONResponse:
        form_data = LoginUserForm.parse_obj(await request.json())
        result = self._auth_service.generate_token_for_user(
            form_data.username, form_data.password
        )
        return JSONResponse(content=result)

    async def is_cluster_authenticated(self) -> JSONResponse:
        return JSONResponse(content={"auth": self.is_authenticated()})

    def serve(self, logging_conf: Optional[dict] = None):
        self._app.add_middleware(
            CORSMiddleware,
            allow_origins=["*"],
            allow_credentials=True,
            allow_methods=["*"],
            allow_headers=["*"],
        )

        # internal interface
        self._router.add_api_route("/status", self.get_status, methods=["GET"])
        # conflict with /v1/models/{model_uid} below, so register this first
        self._router.add_api_route(
            "/v1/models/prompts", self._get_builtin_prompts, methods=["GET"]
        )
        self._router.add_api_route(
            "/v1/models/families", self._get_builtin_families, methods=["GET"]
        )
        self._router.add_api_route(
            "/v1/models/vllm-supported",
            self.list_vllm_supported_model_families,
            methods=["GET"],
        )
        self._router.add_api_route(
            "/v1/cluster/info", self.get_cluster_device_info, methods=["GET"]
        )
        self._router.add_api_route(
            "/v1/cluster/version", self.get_cluster_version, methods=["GET"]
        )
        self._router.add_api_route(
            "/v1/cluster/devices", self._get_devices_count, methods=["GET"]
        )
        self._router.add_api_route("/v1/address", self.get_address, methods=["GET"])

        # user interface
        self._router.add_api_route(
            "/v1/ui/{model_uid}",
            self.build_gradio_interface,
            methods=["POST"],
            dependencies=(
                [Security(self._auth_service, scopes=["models:read"])]
                if self.is_authenticated()
                else None
            ),
        )
        self._router.add_api_route(
            "/v1/ui/images/{model_uid}",
            self.build_gradio_images_interface,
            methods=["POST"],
            dependencies=(
                [Security(self._auth_service, scopes=["models:read"])]
                if self.is_authenticated()
                else None
            ),
        )
        self._router.add_api_route(
            "/token", self.login_for_access_token, methods=["POST"]
        )
        self._router.add_api_route(
            "/v1/cluster/auth", self.is_cluster_authenticated, methods=["GET"]
        )
        self._router.add_api_route(
            "/v1/engines/{model_name}",
            self.query_engines_by_model_name,
            methods=["GET"],
            dependencies=(
                [Security(self._auth_service, scopes=["models:list"])]
                if self.is_authenticated()
                else None
            ),
        )
        # running instances
        self._router.add_api_route(
            "/v1/models/instances",
            self.get_instance_info,
            methods=["GET"],
            dependencies=(
                [Security(self._auth_service, scopes=["models:list"])]
                if self.is_authenticated()
                else None
            ),
        )
        self._router.add_api_route(
            "/v1/models/{model_type}/{model_name}/versions",
            self.get_model_versions,
            methods=["GET"],
            dependencies=(
                [Security(self._auth_service, scopes=["models:list"])]
                if self.is_authenticated()
                else None
            ),
        )
        self._router.add_api_route(
            "/v1/models",
            self.list_models,
            methods=["GET"],
            dependencies=(
                [Security(self._auth_service, scopes=["models:list"])]
                if self.is_authenticated()
                else None
            ),
        )

        self._router.add_api_route(
            "/v1/models/{model_uid}",
            self.describe_model,
            methods=["GET"],
            dependencies=(
                [Security(self._auth_service, scopes=["models:list"])]
                if self.is_authenticated()
                else None
            ),
        )
        self._router.add_api_route(
            "/v1/models/{model_uid}/events",
            self.get_model_events,
            methods=["GET"],
            dependencies=(
                [Security(self._auth_service, scopes=["models:read"])]
                if self.is_authenticated()
                else None
            ),
        )
        self._router.add_api_route(
            "/v1/models/instance",
            self.launch_model_by_version,
            methods=["POST"],
            dependencies=(
                [Security(self._auth_service, scopes=["models:start"])]
                if self.is_authenticated()
                else None
            ),
        )
        self._router.add_api_route(
            "/v1/models",
            self.launch_model,
            methods=["POST"],
            dependencies=(
                [Security(self._auth_service, scopes=["models:start"])]
                if self.is_authenticated()
                else None
            ),
        )
        self._router.add_api_route(
            "/v1/models/{model_uid}",
            self.terminate_model,
            methods=["DELETE"],
            dependencies=(
                [Security(self._auth_service, scopes=["models:stop"])]
                if self.is_authenticated()
                else None
            ),
        )
        self._router.add_api_route(
            "/v1/completions",
            self.create_completion,
            methods=["POST"],
            response_model=Completion,
            dependencies=(
                [Security(self._auth_service, scopes=["models:read"])]
                if self.is_authenticated()
                else None
            ),
        )
        self._router.add_api_route(
            "/v1/embeddings",
            self.create_embedding,
            methods=["POST"],
            dependencies=(
                [Security(self._auth_service, scopes=["models:read"])]
                if self.is_authenticated()
                else None
            ),
        )
        self._router.add_api_route(
            "/v1/rerank",
            self.rerank,
            methods=["POST"],
            dependencies=(
                [Security(self._auth_service, scopes=["models:read"])]
                if self.is_authenticated()
                else None
            ),
        )
        self._router.add_api_route(
            "/v1/audio/transcriptions",
            self.create_transcriptions,
            methods=["POST"],
            dependencies=(
                [Security(self._auth_service, scopes=["models:read"])]
                if self.is_authenticated()
                else None
            ),
        )
        self._router.add_api_route(
            "/v1/audio/translations",
            self.create_translations,
            methods=["POST"],
            dependencies=(
                [Security(self._auth_service, scopes=["models:read"])]
                if self.is_authenticated()
                else None
            ),
        )
        self._router.add_api_route(
            "/v1/images/generations",
            self.create_images,
            methods=["POST"],
            response_model=ImageList,
            dependencies=(
                [Security(self._auth_service, scopes=["models:read"])]
                if self.is_authenticated()
                else None
            ),
        )
        self._router.add_api_route(
            "/v1/images/variations",
            self.create_variations,
            methods=["POST"],
            response_model=ImageList,
            dependencies=(
                [Security(self._auth_service, scopes=["models:read"])]
                if self.is_authenticated()
                else None
            ),
        )
        self._router.add_api_route(
            "/v1/chat/completions",
            self.create_chat_completion,
            methods=["POST"],
            response_model=ChatCompletion,
            dependencies=(
                [Security(self._auth_service, scopes=["models:read"])]
                if self.is_authenticated()
                else None
            ),
        )

        # for custom models
        self._router.add_api_route(
            "/v1/model_registrations/{model_type}",
            self.register_model,
            methods=["POST"],
            dependencies=(
                [Security(self._auth_service, scopes=["models:register"])]
                if self.is_authenticated()
                else None
            ),
        )
        self._router.add_api_route(
            "/v1/model_registrations/{model_type}/{model_name}",
            self.unregister_model,
            methods=["DELETE"],
            dependencies=(
                [Security(self._auth_service, scopes=["models:unregister"])]
                if self.is_authenticated()
                else None
            ),
        )
        self._router.add_api_route(
            "/v1/model_registrations/{model_type}",
            self.list_model_registrations,
            methods=["GET"],
            dependencies=(
                [Security(self._auth_service, scopes=["models:list"])]
                if self.is_authenticated()
                else None
            ),
        )
        self._router.add_api_route(
            "/v1/model_registrations/{model_type}/{model_name}",
            self.get_model_registrations,
            methods=["GET"],
            dependencies=(
                [Security(self._auth_service, scopes=["models:list"])]
                if self.is_authenticated()
                else None
            ),
        )
        self._router.add_api_route(
            "/v1/cached/list_cached_models",
            self.list_cached_models,
            methods=["GET"],
            dependencies=(
                [Security(self._auth_service, scopes=["models:list"])]
                if self.is_authenticated()
                else None
            ),
        )

        self._router.add_api_route(
            "/v1/dataset/download_template/{file_type}/{file_name}",
            self.download_template,
            methods=["GET"],
            dependencies=(
                [Security(self._auth_service, scopes=["models:list"])]
                if self.is_authenticated()
                else None
            ),
        )

        # for dataset
        self._router.add_api_route(
            "/v1/dataset/list_dataset",
            self.list_dataset,
            methods=["GET"],
            dependencies=(
                [Security(self._auth_service, scopes=["models:list"])]
                if self.is_authenticated()
                else None
            ),
        )
        self._router.add_api_route(
            "/v1/dataset/create_dataset",
            self.create_dataset,
            methods=["POST"],
            dependencies=(
                [Security(self._auth_service, scopes=["models:list"])]
                if self.is_authenticated()
                else None
            ),
        )
        self._router.add_api_route(
            "/v1/dataset/delete_dataset",
            self.delete_dataset,
            methods=["POST"],
            dependencies=(
                [Security(self._auth_service, scopes=["models:list"])]
                if self.is_authenticated()
                else None
            ),
        )
        self._router.add_api_route(
            "/v1/dataset/add_data",
            self.add_data,
            methods=["POST"],
            dependencies=(
                [Security(self._auth_service, scopes=["models:list"])]
                if self.is_authenticated()
                else None
            ),
        )
        self._router.add_api_route(
            "/v1/dataset/read_data",
            self.read_data,
            methods=["POST"],
            dependencies=(
                [Security(self._auth_service, scopes=["models:list"])]
                if self.is_authenticated()
                else None
            ),
        )
        self._router.add_api_route(
            "/v1/dataset/upload_data",
            self.upload_data,
            methods=["POST"],
            dependencies=(
                [Security(self._auth_service, scopes=["models:list"])]
                if self.is_authenticated()
                else None
            ),
        )
        self._router.add_api_route(
            "/v1/runner/training",
            self.training,
            methods=["POST"],
            dependencies=(
                [Security(self._auth_service, scopes=["models:list"])]
                if self.is_authenticated()
                else None
            ),
        ),
        self._router.add_api_route(
            "/v1/runner/advanced_training",
            self.advanced_training,
            methods=["POST"],
            dependencies=(
                [Security(self._auth_service, scopes=["models:list"])]
                if self.is_authenticated()
                else None
            ),
        ),
        self._router.add_api_route(
            "/v1/runner/terminate",
            self.terminate,
            methods=["GET"],
            dependencies=(
                [Security(self._auth_service, scopes=["models:list"])]
                if self.is_authenticated()
                else None
            ),
        ),
        self._router.add_api_route(
            "/logs/list_logs",
            self.list_logs,
            methods=["GET"],
            dependencies=(
                [Security(self._auth_service, scopes=["models:list"])]
                if self.is_authenticated()
                else None
            ),
        )
        self._router.add_api_route(
            "/logs/get_logs",
            self.get_logs,
            methods=["GET"],
            dependencies=(
                [Security(self._auth_service, scopes=["models:list"])]
                if self.is_authenticated()
                else None
            ),
        )


        if XINFERENCE_DISABLE_METRICS:
            logger.info(
                "Supervisor metrics is disabled due to the environment XINFERENCE_DISABLE_METRICS=1"
            )
            self._app.include_router(self._router)
        else:
            # Clear the global Registry for the MetricsMiddleware, or
            # the MetricsMiddleware will register duplicated metrics if the port
            # conflict (This serve method run more than once).
            REGISTRY.clear()
            self._app.add_middleware(MetricsMiddleware)
            self._app.include_router(self._router)
            self._app.add_route("/metrics", metrics)

        # Check all the routes returns Response.
        # This is to avoid `jsonable_encoder` performance issue:
        # https://github.com/xorbitsai/inference/issues/647
        invalid_routes = []
        try:
            for router in self._router.routes:
                return_annotation = router.endpoint.__annotations__.get("return")
                if not inspect.isclass(return_annotation) or not issubclass(
                    return_annotation, Response
                ):
                    invalid_routes.append(
                        (router.path, router.endpoint, return_annotation)
                    )
        except Exception:
            pass  # In case that some Python version does not have __annotations__
        if invalid_routes:
            raise Exception(
                f"The return value type of the following routes is not Response:\n"
                f"{pprint.pformat(invalid_routes)}"
            )

        class SPAStaticFiles(StaticFiles):
            async def get_response(self, path: str, scope):
                response = await super().get_response(path, scope)
                if response.status_code == 404:
                    response = await super().get_response(".", scope)
                return response

        try:
            package_file_path = __import__("xinference").__file__
            assert package_file_path is not None
            lib_location = os.path.abspath(os.path.dirname(package_file_path))
            ui_location = os.path.join(lib_location, "web/ui/build/")
        except ImportError as e:
            raise ImportError(f"Xinference is imported incorrectly: {e}")

        if os.path.exists(ui_location):

            @self._app.get("/")
            def read_main():
                response = RedirectResponse(url="/ui/")
                return response

            self._app.mount(
                "/ui/",
                SPAStaticFiles(directory=ui_location, html=True),
            )
        else:
            warnings.warn(
                f"""
            Xinference ui is not built at expected directory: {ui_location}
            To resolve this warning, navigate to {os.path.join(lib_location, "web/ui/")}
            And build the Xinference ui by running "npm run build"
            """
            )

        config = Config(
            app=self._app, host=self._host, port=self._port, log_config=logging_conf
        )
        server = Server(config)
        server.run()

    async def _get_builtin_prompts(self) -> JSONResponse:
        """
        For internal usage
        """
        try:
            data = await (await self._get_supervisor_ref()).get_builtin_prompts()
            return JSONResponse(content=data)
        except Exception as e:
            logger.error(e, exc_info=True)
            raise HTTPException(status_code=500, detail=str(e))

    async def _get_builtin_families(self) -> JSONResponse:
        """
        For internal usage
        """
        try:
            data = await (await self._get_supervisor_ref()).get_builtin_families()
            return JSONResponse(content=data)
        except Exception as e:
            logger.error(e, exc_info=True)
            raise HTTPException(status_code=500, detail=str(e))

    async def _get_devices_count(self) -> JSONResponse:
        """
        For internal usage
        """
        try:
            data = await (await self._get_supervisor_ref()).get_devices_count()
            return JSONResponse(content=data)
        except Exception as e:
            logger.error(e, exc_info=True)
            raise HTTPException(status_code=500, detail=str(e))

    async def get_status(self) -> JSONResponse:
        try:
            data = await (await self._get_supervisor_ref()).get_status()
            return JSONResponse(content=data)
        except Exception as e:
            logger.error(e, exc_info=True)
            raise HTTPException(status_code=500, detail=str(e))

    async def list_models(self) -> JSONResponse:
        try:
            models = await (await self._get_supervisor_ref()).list_models()

            model_list = []
            for model_id, model_info in models.items():
                model_list.append(
                    {
                        "id": model_id,
                        "object": "model",
                        "created": 0,
                        "owned_by": "xinference",
                        **model_info,
                    }
                )
            response = {"object": "list", "data": model_list}

            return JSONResponse(content=response)
        except Exception as e:
            logger.error(e, exc_info=True)
            raise HTTPException(status_code=500, detail=str(e))

    async def describe_model(self, model_uid: str) -> JSONResponse:
        try:
            data = await (await self._get_supervisor_ref()).describe_model(model_uid)
            return JSONResponse(content=data)
        except ValueError as ve:
            logger.error(str(ve), exc_info=True)
            raise HTTPException(status_code=400, detail=str(ve))

        except Exception as e:
            logger.error(e, exc_info=True)
            raise HTTPException(status_code=500, detail=str(e))

    async def launch_model(
        self, request: Request, wait_ready: bool = Query(True)
    ) -> JSONResponse:
        payload = await request.json()
        model_uid = payload.get("model_uid")
        model_name = payload.get("model_name")
        model_engine = payload.get("model_engine")
        model_size_in_billions = payload.get("model_size_in_billions")
        model_format = payload.get("model_format")
        quantization = payload.get("quantization")
        model_type = payload.get("model_type", "LLM")
        replica = payload.get("replica", 1)
        n_gpu = payload.get("n_gpu", "auto")
        request_limits = payload.get("request_limits", None)
        peft_model_config = payload.get("peft_model_config", None)
        worker_ip = payload.get("worker_ip", None)
        gpu_idx = payload.get("gpu_idx", None)

        exclude_keys = {
            "model_uid",
            "model_name",
            "model_engine",
            "model_size_in_billions",
            "model_format",
            "quantization",
            "model_type",
            "replica",
            "n_gpu",
            "request_limits",
            "peft_model_config",
            "worker_ip",
            "gpu_idx",
        }

        kwargs = {
            key: value for key, value in payload.items() if key not in exclude_keys
        }

        if not model_name:
            raise HTTPException(
                status_code=400,
                detail="Invalid input. Please specify the `model_name` field.",
            )
        if not model_engine and model_type == "LLM":
            raise HTTPException(
                status_code=400,
                detail="Invalid input. Please specify the `model_engine` field.",
            )

        if isinstance(gpu_idx, int):
            gpu_idx = [gpu_idx]
        if gpu_idx:
            if len(gpu_idx) % replica:
                raise HTTPException(
                    status_code=400,
                    detail="Invalid input. Allocated gpu must be a multiple of replica.",
                )

        if peft_model_config is not None:
            peft_model_config = PeftModelConfig.from_dict(peft_model_config)
        else:
            peft_model_config = None

        try:
            model_uid = await (await self._get_supervisor_ref()).launch_builtin_model(
                model_uid=model_uid,
                model_name=model_name,
                model_engine=model_engine,
                model_size_in_billions=model_size_in_billions,
                model_format=model_format,
                quantization=quantization,
                model_type=model_type,
                replica=replica,
                n_gpu=n_gpu,
                request_limits=request_limits,
                wait_ready=wait_ready,
                peft_model_config=peft_model_config,
                worker_ip=worker_ip,
                gpu_idx=gpu_idx,
                **kwargs,
            )

        except ValueError as ve:
            logger.error(str(ve), exc_info=True)
            raise HTTPException(status_code=400, detail=str(ve))
        except RuntimeError as re:
            logger.error(str(re), exc_info=True)
            raise HTTPException(status_code=503, detail=str(re))
        except Exception as e:
            logger.error(str(e), exc_info=True)
            raise HTTPException(status_code=500, detail=str(e))

        return JSONResponse(content={"model_uid": model_uid})

    async def get_instance_info(
        self,
        model_name: Optional[str] = Query(None),
        model_uid: Optional[str] = Query(None),
    ) -> JSONResponse:
        try:
            infos = await (await self._get_supervisor_ref()).get_instance_info(
                model_name, model_uid
            )
        except Exception as e:
            logger.error(str(e), exc_info=True)
            raise HTTPException(status_code=500, detail=str(e))
        return JSONResponse(content=infos)

    async def launch_model_by_version(
        self, request: Request, wait_ready: bool = Query(True)
    ) -> JSONResponse:
        payload = await request.json()
        model_uid = payload.get("model_uid")
        model_engine = payload.get("model_engine")
        model_type = payload.get("model_type")
        model_version = payload.get("model_version")
        replica = payload.get("replica", 1)
        n_gpu = payload.get("n_gpu", "auto")

        try:
            model_uid = await (
                await self._get_supervisor_ref()
            ).launch_model_by_version(
                model_uid=model_uid,
                model_engine=model_engine,
                model_type=model_type,
                model_version=model_version,
                replica=replica,
                n_gpu=n_gpu,
                wait_ready=wait_ready,
            )
        except Exception as e:
            logger.error(str(e), exc_info=True)
            raise HTTPException(status_code=500, detail=str(e))
        return JSONResponse(content={"model_uid": model_uid})

    async def get_model_versions(
        self, model_type: str, model_name: str
    ) -> JSONResponse:
        try:
            content = await (await self._get_supervisor_ref()).get_model_versions(
                model_type, model_name
            )
            return JSONResponse(content=content)
        except Exception as e:
            logger.error(e, exc_info=True)
            raise HTTPException(status_code=500, detail=str(e))

    async def build_gradio_interface(
        self, model_uid: str, request: Request
    ) -> JSONResponse:
        """
        Separate build_interface with launch_model
        build_interface requires RESTful Client for API calls
        but calling API in async function does not return
        """
        payload = await request.json()
        body = BuildGradioInterfaceRequest.parse_obj(payload)
        assert self._app is not None
        assert body.model_type == "LLM"

        # asyncio.Lock() behaves differently in 3.9 than 3.10+
        # A event loop is required in 3.9 but not 3.10+
        if sys.version_info < (3, 10):
            try:
                asyncio.get_event_loop()
            except RuntimeError:
                warnings.warn(
                    "asyncio.Lock() requires an event loop in Python 3.9"
                    + "a placeholder event loop has been created"
                )
                asyncio.set_event_loop(asyncio.new_event_loop())

        from ..core.chat_interface import GradioInterface

        try:
            access_token = request.headers.get("Authorization")
            internal_host = "localhost" if self._host == "0.0.0.0" else self._host
            interface = GradioInterface(
                endpoint=f"http://{internal_host}:{self._port}",
                model_uid=model_uid,
                model_name=body.model_name,
                model_size_in_billions=body.model_size_in_billions,
                model_type=body.model_type,
                model_format=body.model_format,
                quantization=body.quantization,
                context_length=body.context_length,
                model_ability=body.model_ability,
                model_description=body.model_description,
                model_lang=body.model_lang,
                access_token=access_token,
            ).build()
            gr.mount_gradio_app(self._app, interface, f"/{model_uid}")
        except ValueError as ve:
            logger.error(str(ve), exc_info=True)
            raise HTTPException(status_code=400, detail=str(ve))

        except Exception as e:
            logger.error(e, exc_info=True)
            raise HTTPException(status_code=500, detail=str(e))

        return JSONResponse(content={"model_uid": model_uid})

    async def build_gradio_images_interface(
        self, model_uid: str, request: Request
    ) -> JSONResponse:
        """
        Build a Gradio interface for image processing models.
        """
        payload = await request.json()
        body = BuildGradioImageInterfaceRequest.parse_obj(payload)
        assert self._app is not None
        assert body.model_type == "image"

        # asyncio.Lock() behaves differently in 3.9 than 3.10+
        # A event loop is required in 3.9 but not 3.10+
        if sys.version_info < (3, 10):
            try:
                asyncio.get_event_loop()
            except RuntimeError:
                warnings.warn(
                    "asyncio.Lock() requires an event loop in Python 3.9"
                    + "a placeholder event loop has been created"
                )
                asyncio.set_event_loop(asyncio.new_event_loop())

        from ..core.image_interface import ImageInterface

        try:
            access_token = request.headers.get("Authorization")
            internal_host = "localhost" if self._host == "0.0.0.0" else self._host
            interface = ImageInterface(
                endpoint=f"http://{internal_host}:{self._port}",
                model_uid=model_uid,
                model_family=body.model_family,
                model_name=body.model_name,
                model_id=body.model_id,
                model_revision=body.model_revision,
                controlnet=body.controlnet,
                access_token=access_token,
            ).build()

            gr.mount_gradio_app(self._app, interface, f"/{model_uid}")
        except ValueError as ve:
            logger.error(str(ve), exc_info=True)
            raise HTTPException(status_code=400, detail=str(ve))

        except Exception as e:
            logger.error(e, exc_info=True)
            raise HTTPException(status_code=500, detail=str(e))

        return JSONResponse(content={"model_uid": model_uid})

    async def terminate_model(self, model_uid: str) -> JSONResponse:
        try:
            assert self._app is not None
            await (await self._get_supervisor_ref()).terminate_model(model_uid)
            self._app.router.routes = [
                route
                for route in self._app.router.routes
                if not (
                    hasattr(route, "path")
                    and isinstance(route.path, str)
                    and route.path == "/" + model_uid
                )
            ]
        except ValueError as ve:
            logger.error(str(ve), exc_info=True)
            raise HTTPException(status_code=400, detail=str(ve))
        except Exception as e:
            logger.error(e, exc_info=True)
            raise HTTPException(status_code=500, detail=str(e))
        return JSONResponse(content=None)

    async def get_address(self) -> JSONResponse:
        return JSONResponse(content=self._supervisor_address)

    async def create_completion(self, request: Request) -> Response:
        body = CreateCompletionRequest.parse_obj(await request.json())
        exclude = {
            "prompt",
            "model",
            "n",
            "best_of",
            "logit_bias",
            "logit_bias_type",
            "user",
        }
        kwargs = body.dict(exclude_unset=True, exclude=exclude)

        # TODO: Decide if this default value override is necessary #1061
        if body.max_tokens is None:
            kwargs["max_tokens"] = max_tokens_field.default

        if body.logit_bias is not None:
            raise HTTPException(status_code=501, detail="Not implemented")

        model_uid = body.model

        try:
            model = await (await self._get_supervisor_ref()).get_model(model_uid)
        except ValueError as ve:
            logger.error(str(ve), exc_info=True)
            await self._report_error_event(model_uid, str(ve))
            raise HTTPException(status_code=400, detail=str(ve))

        except Exception as e:
            logger.error(e, exc_info=True)
            await self._report_error_event(model_uid, str(e))
            raise HTTPException(status_code=500, detail=str(e))

        if body.stream:

            async def stream_results():
                iterator = None
                try:
                    try:
                        iterator = await model.generate(body.prompt, kwargs)
                    except RuntimeError as re:
                        self.handle_request_limit_error(re)
                    async for item in iterator:
                        yield item
                except asyncio.CancelledError:
                    logger.info(
                        f"Disconnected from client (via refresh/close) {request.client} during generate."
                    )
                    return
                except Exception as ex:
                    logger.exception("Completion stream got an error: %s", ex)
                    await self._report_error_event(model_uid, str(ex))
                    # https://github.com/openai/openai-python/blob/e0aafc6c1a45334ac889fe3e54957d309c3af93f/src/openai/_streaming.py#L107
                    yield dict(data=json.dumps({"error": str(ex)}))
                    return

            return EventSourceResponse(stream_results())
        else:
            try:
                data = await model.generate(body.prompt, kwargs)
                return Response(data, media_type="application/json")
            except Exception as e:
                logger.error(e, exc_info=True)
                await self._report_error_event(model_uid, str(e))
                self.handle_request_limit_error(e)
                raise HTTPException(status_code=500, detail=str(e))

    async def create_embedding(self, request: Request) -> Response:
        payload = await request.json()
        body = CreateEmbeddingRequest.parse_obj(payload)
        model_uid = body.model
        exclude = {
            "model",
            "input",
            "user",
            "encoding_format",
        }
        kwargs = {key: value for key, value in payload.items() if key not in exclude}

        try:
            model = await (await self._get_supervisor_ref()).get_model(model_uid)
        except ValueError as ve:
            logger.error(str(ve), exc_info=True)
            await self._report_error_event(model_uid, str(ve))
            raise HTTPException(status_code=400, detail=str(ve))
        except Exception as e:
            logger.error(e, exc_info=True)
            await self._report_error_event(model_uid, str(e))
            raise HTTPException(status_code=500, detail=str(e))

        try:
            embedding = await model.create_embedding(body.input, **kwargs)
            return Response(embedding, media_type="application/json")
        except RuntimeError as re:
            logger.error(re, exc_info=True)
            await self._report_error_event(model_uid, str(re))
            self.handle_request_limit_error(re)
            raise HTTPException(status_code=400, detail=str(re))
        except Exception as e:
            logger.error(e, exc_info=True)
            await self._report_error_event(model_uid, str(e))
            raise HTTPException(status_code=500, detail=str(e))

    async def rerank(self, request: Request) -> Response:
        payload = await request.json()
        body = RerankRequest.parse_obj(payload)
        model_uid = body.model
        kwargs = {
            key: value
            for key, value in payload.items()
            if key not in RerankRequest.__annotations__.keys()
        }

        try:
            model = await (await self._get_supervisor_ref()).get_model(model_uid)
        except ValueError as ve:
            logger.error(str(ve), exc_info=True)
            await self._report_error_event(model_uid, str(ve))
            raise HTTPException(status_code=400, detail=str(ve))
        except Exception as e:
            logger.error(e, exc_info=True)
            await self._report_error_event(model_uid, str(e))
            raise HTTPException(status_code=500, detail=str(e))

        try:
            scores = await model.rerank(
                body.documents,
                body.query,
                top_n=body.top_n,
                max_chunks_per_doc=body.max_chunks_per_doc,
                return_documents=body.return_documents,
                **kwargs,
            )
            return Response(scores, media_type="application/json")
        except RuntimeError as re:
            logger.error(re, exc_info=True)
            await self._report_error_event(model_uid, str(re))
            self.handle_request_limit_error(re)
            raise HTTPException(status_code=400, detail=str(re))
        except Exception as e:
            logger.error(e, exc_info=True)
            await self._report_error_event(model_uid, str(e))
            raise HTTPException(status_code=500, detail=str(e))

    async def create_transcriptions(
        self,
        request: Request,
        model: str = Form(...),
        file: UploadFile = File(media_type="application/octet-stream"),
        language: Optional[str] = Form(None),
        prompt: Optional[str] = Form(None),
        response_format: Optional[str] = Form("json"),
        temperature: Optional[float] = Form(0),
        kwargs: Optional[str] = Form(None),
    ) -> Response:
        form = await request.form()
        timestamp_granularities = form.get("timestamp_granularities[]")
        if timestamp_granularities:
            timestamp_granularities = [timestamp_granularities]
        model_uid = model
        try:
            model_ref = await (await self._get_supervisor_ref()).get_model(model_uid)
        except ValueError as ve:
            logger.error(str(ve), exc_info=True)
            await self._report_error_event(model_uid, str(ve))
            raise HTTPException(status_code=400, detail=str(ve))
        except Exception as e:
            logger.error(e, exc_info=True)
            await self._report_error_event(model_uid, str(e))
            raise HTTPException(status_code=500, detail=str(e))

        try:
            if kwargs is not None:
                parsed_kwargs = json.loads(kwargs)
            else:
                parsed_kwargs = {}
            transcription = await model_ref.transcriptions(
                audio=await file.read(),
                language=language,
                prompt=prompt,
                response_format=response_format,
                temperature=temperature,
                timestamp_granularities=timestamp_granularities,
                **parsed_kwargs,
            )
            return Response(content=transcription, media_type="application/json")
        except RuntimeError as re:
            logger.error(re, exc_info=True)
            await self._report_error_event(model_uid, str(re))
            raise HTTPException(status_code=400, detail=str(re))
        except Exception as e:
            logger.error(e, exc_info=True)
            await self._report_error_event(model_uid, str(e))
            raise HTTPException(status_code=500, detail=str(e))

    async def create_translations(
        self,
        request: Request,
        model: str = Form(...),
        file: UploadFile = File(media_type="application/octet-stream"),
        language: Optional[str] = Form(None),
        prompt: Optional[str] = Form(None),
        response_format: Optional[str] = Form("json"),
        temperature: Optional[float] = Form(0),
        kwargs: Optional[str] = Form(None),
    ) -> Response:
        form = await request.form()
        timestamp_granularities = form.get("timestamp_granularities[]")
        if timestamp_granularities:
            timestamp_granularities = [timestamp_granularities]
        model_uid = model
        try:
            model_ref = await (await self._get_supervisor_ref()).get_model(model_uid)
        except ValueError as ve:
            logger.error(str(ve), exc_info=True)
            await self._report_error_event(model_uid, str(ve))
            raise HTTPException(status_code=400, detail=str(ve))
        except Exception as e:
            logger.error(e, exc_info=True)
            await self._report_error_event(model_uid, str(e))
            raise HTTPException(status_code=500, detail=str(e))

        try:
            if kwargs is not None:
                parsed_kwargs = json.loads(kwargs)
            else:
                parsed_kwargs = {}
            translation = await model_ref.translations(
                audio=await file.read(),
                language=language,
                prompt=prompt,
                response_format=response_format,
                temperature=temperature,
                timestamp_granularities=timestamp_granularities,
                **parsed_kwargs,
            )
            return Response(content=translation, media_type="application/json")
        except RuntimeError as re:
            logger.error(re, exc_info=True)
            await self._report_error_event(model_uid, str(re))
            raise HTTPException(status_code=400, detail=str(re))
        except Exception as e:
            logger.error(e, exc_info=True)
            await self._report_error_event(model_uid, str(e))
            raise HTTPException(status_code=500, detail=str(e))

    async def create_images(self, request: Request) -> Response:
        body = TextToImageRequest.parse_obj(await request.json())
        model_uid = body.model
        try:
            model = await (await self._get_supervisor_ref()).get_model(model_uid)
        except ValueError as ve:
            logger.error(str(ve), exc_info=True)
            await self._report_error_event(model_uid, str(ve))
            raise HTTPException(status_code=400, detail=str(ve))
        except Exception as e:
            logger.error(e, exc_info=True)
            await self._report_error_event(model_uid, str(e))
            raise HTTPException(status_code=500, detail=str(e))

        try:
            kwargs = json.loads(body.kwargs) if body.kwargs else {}
            image_list = await model.text_to_image(
                prompt=body.prompt,
                n=body.n,
                size=body.size,
                response_format=body.response_format,
                **kwargs,
            )
            return Response(content=image_list, media_type="application/json")
        except RuntimeError as re:
            logger.error(re, exc_info=True)
            await self._report_error_event(model_uid, str(re))
            self.handle_request_limit_error(re)
            raise HTTPException(status_code=400, detail=str(re))
        except Exception as e:
            logger.error(e, exc_info=True)
            await self._report_error_event(model_uid, str(e))
            raise HTTPException(status_code=500, detail=str(e))

    async def create_variations(
        self,
        model: str = Form(...),
        image: UploadFile = File(media_type="application/octet-stream"),
        prompt: Optional[Union[str, List[str]]] = Form(None),
        negative_prompt: Optional[Union[str, List[str]]] = Form(None),
        n: Optional[int] = Form(1),
        response_format: Optional[str] = Form("url"),
        size: Optional[str] = Form("1024*1024"),
        kwargs: Optional[str] = Form(None),
    ) -> Response:
        model_uid = model
        try:
            model_ref = await (await self._get_supervisor_ref()).get_model(model_uid)
        except ValueError as ve:
            logger.error(str(ve), exc_info=True)
            await self._report_error_event(model_uid, str(ve))
            raise HTTPException(status_code=400, detail=str(ve))
        except Exception as e:
            logger.error(e, exc_info=True)
            await self._report_error_event(model_uid, str(e))
            raise HTTPException(status_code=500, detail=str(e))

        try:
            if kwargs is not None:
                parsed_kwargs = json.loads(kwargs)
            else:
                parsed_kwargs = {}
            image_list = await model_ref.image_to_image(
                image=Image.open(image.file),
                prompt=prompt,
                negative_prompt=negative_prompt,
                n=n,
                size=size,
                response_format=response_format,
                **parsed_kwargs,
            )
            return Response(content=image_list, media_type="application/json")
        except RuntimeError as re:
            logger.error(re, exc_info=True)
            await self._report_error_event(model_uid, str(re))
            raise HTTPException(status_code=400, detail=str(re))
        except Exception as e:
            logger.error(e, exc_info=True)
            await self._report_error_event(model_uid, str(e))
            raise HTTPException(status_code=500, detail=str(e))

    async def create_chat_completion(self, request: Request) -> Response:
        body = CreateChatCompletion.parse_obj(await request.json())
        exclude = {
            "prompt",
            "model",
            "n",
            "messages",
            "logit_bias",
            "logit_bias_type",
            "user",
        }
        kwargs = body.dict(exclude_unset=True, exclude=exclude)

        # TODO: Decide if this default value override is necessary #1061
        if body.max_tokens is None:
            kwargs["max_tokens"] = max_tokens_field.default

        if body.logit_bias is not None:
            raise HTTPException(status_code=501, detail="Not implemented")

        messages = body.messages and list(body.messages) or None

        if not messages or messages[-1].get("role") not in ["user", "system", "tool"]:
            raise HTTPException(
                status_code=400, detail="Invalid input. Please specify the prompt."
            )

        system_messages: List["ChatCompletionMessage"] = []
        system_messages_contents = []
        non_system_messages = []
        for msg in messages:
            assert (
                msg.get("content") != SPECIAL_TOOL_PROMPT
            ), f"Invalid message content {SPECIAL_TOOL_PROMPT}"
            if msg["role"] == "system":
                system_messages_contents.append(msg["content"])
            else:
                non_system_messages.append(msg)
        system_messages.append(
            {"role": "system", "content": ". ".join(system_messages_contents)}
        )

        has_tool_message = messages[-1].get("role") == "tool"
        if has_tool_message:
            prompt = SPECIAL_TOOL_PROMPT
            system_prompt = system_messages[0]["content"] if system_messages else None
            chat_history = non_system_messages  # exclude the prompt
        else:
            prompt = None
            if non_system_messages:
                prompt = non_system_messages[-1]["content"]
            system_prompt = system_messages[0]["content"] if system_messages else None
            chat_history = non_system_messages[:-1]  # exclude the prompt

        model_uid = body.model

        try:
            model = await (await self._get_supervisor_ref()).get_model(model_uid)
        except ValueError as ve:
            logger.error(str(ve), exc_info=True)
            await self._report_error_event(model_uid, str(ve))
            raise HTTPException(status_code=400, detail=str(ve))
        except Exception as e:
            logger.error(e, exc_info=True)
            await self._report_error_event(model_uid, str(e))
            raise HTTPException(status_code=500, detail=str(e))

        try:
            desc = await (await self._get_supervisor_ref()).describe_model(model_uid)
        except ValueError as ve:
            logger.error(str(ve), exc_info=True)
            await self._report_error_event(model_uid, str(ve))
            raise HTTPException(status_code=400, detail=str(ve))
        except Exception as e:
            logger.error(e, exc_info=True)
            await self._report_error_event(model_uid, str(e))
            raise HTTPException(status_code=500, detail=str(e))

        model_family = desc.get("model_family", "")
        function_call_models = [
            "chatglm3",
            "gorilla-openfunctions-v1",
            "qwen-chat",
            "qwen1.5-chat",
        ]

        is_qwen = desc.get("model_format") == "ggmlv3" and "qwen-chat" == model_family

        if is_qwen and system_prompt is not None:
            raise HTTPException(
                status_code=400, detail="Qwen ggml does not have system prompt"
            )

        if model_family not in function_call_models:
            if body.tools:
                raise HTTPException(
                    status_code=400,
                    detail=f"Only {function_call_models} support tool calls",
                )
            if has_tool_message:
                raise HTTPException(
                    status_code=400,
                    detail=f"Only {function_call_models} support tool messages",
                )
        if body.tools and body.stream:
            is_vllm = await model.is_vllm_backend()
            if not is_vllm or model_family not in ["qwen-chat", "qwen1.5-chat"]:
                raise HTTPException(
                    status_code=400,
                    detail="Streaming support for tool calls is available only when using vLLM backend and Qwen models.",
                )

        if body.stream:

            async def stream_results():
                iterator = None
                try:
                    try:
                        if is_qwen:
                            iterator = await model.chat(prompt, chat_history, kwargs)
                        else:
                            iterator = await model.chat(
                                prompt, system_prompt, chat_history, kwargs
                            )
                    except RuntimeError as re:
                        await self._report_error_event(model_uid, str(re))
                        self.handle_request_limit_error(re)
                    async for item in iterator:
                        yield item
                    yield "[DONE]"
                # Note that asyncio.CancelledError does not inherit from Exception.
                # When the user uses ctrl+c to cancel the streaming chat, asyncio.CancelledError would be triggered.
                # See https://github.com/sysid/sse-starlette/blob/main/examples/example.py#L48
                except asyncio.CancelledError:
                    logger.info(
                        f"Disconnected from client (via refresh/close) {request.client} during chat."
                    )
                    # See https://github.com/sysid/sse-starlette/blob/main/examples/error_handling.py#L13
                    # Use return to stop the generator from continuing.
                    # TODO: Cannot yield here. Yield here would leads to error for the next streaming request.
                    return
                except Exception as ex:
                    logger.exception("Chat completion stream got an error: %s", ex)
                    await self._report_error_event(model_uid, str(ex))
                    # https://github.com/openai/openai-python/blob/e0aafc6c1a45334ac889fe3e54957d309c3af93f/src/openai/_streaming.py#L107
                    yield dict(data=json.dumps({"error": str(ex)}))
                    return

            return EventSourceResponse(stream_results())
        else:
            try:
                if is_qwen:
                    data = await model.chat(prompt, chat_history, kwargs)
                else:
                    data = await model.chat(prompt, system_prompt, chat_history, kwargs)
                return Response(content=data, media_type="application/json")
            except Exception as e:
                logger.error(e, exc_info=True)
                await self._report_error_event(model_uid, str(e))
                self.handle_request_limit_error(e)
                raise HTTPException(status_code=500, detail=str(e))

    async def query_engines_by_model_name(self, model_name: str) -> JSONResponse:
        try:
            content = await (
                await self._get_supervisor_ref()
            ).query_engines_by_model_name(model_name)
            return JSONResponse(content=content)
        except ValueError as re:
            logger.error(re, exc_info=True)
            raise HTTPException(status_code=400, detail=str(re))
        except Exception as e:
            logger.error(e, exc_info=True)
            raise HTTPException(status_code=500, detail=str(e))

    async def register_model(self, model_type: str, request: Request) -> JSONResponse:
        body = RegisterModelRequest.parse_obj(await request.json())
        model = body.model
        persist = body.persist

        try:
            await (await self._get_supervisor_ref()).register_model(
                model_type, model, persist
            )
        except ValueError as re:
            logger.error(re, exc_info=True)
            raise HTTPException(status_code=400, detail=str(re))
        except Exception as e:
            logger.error(e, exc_info=True)
            raise HTTPException(status_code=500, detail=str(e))
        return JSONResponse(content=None)

    async def unregister_model(self, model_type: str, model_name: str) -> JSONResponse:
        try:
            await (await self._get_supervisor_ref()).unregister_model(
                model_type, model_name
            )
        except ValueError as re:
            logger.error(re, exc_info=True)
            raise HTTPException(status_code=400, detail=str(re))
        except Exception as e:
            logger.error(e, exc_info=True)
            raise HTTPException(status_code=500, detail=str(e))
        return JSONResponse(content=None)

    async def list_model_registrations(
        self, model_type: str, detailed: bool = Query(False)
    ) -> JSONResponse:
        try:
            data = await (await self._get_supervisor_ref()).list_model_registrations(
                model_type, detailed=detailed
            )
            return JSONResponse(content=data)
        except ValueError as re:
            logger.error(re, exc_info=True)
            raise HTTPException(status_code=400, detail=str(re))
        except Exception as e:
            logger.error(e, exc_info=True)
            raise HTTPException(status_code=500, detail=str(e))

    async def get_model_registrations(
        self, model_type: str, model_name: str
    ) -> JSONResponse:
        try:
            data = await (await self._get_supervisor_ref()).get_model_registration(
                model_type, model_name
            )
            return JSONResponse(content=data)
        except ValueError as re:
            logger.error(re, exc_info=True)
            raise HTTPException(status_code=400, detail=str(re))
        except Exception as e:
            logger.error(e, exc_info=True)
            raise HTTPException(status_code=500, detail=str(e))

    async def list_cached_models(self) -> JSONResponse:
        try:
            data = await (await self._get_supervisor_ref()).list_cached_models()
            return JSONResponse(content=data)
        except ValueError as re:
            logger.error(re, exc_info=True)
            raise HTTPException(status_code=400, detail=str(re))
        except Exception as e:
            logger.error(e, exc_info=True)
            raise HTTPException(status_code=500, detail=str(e))


    async def get_model_events(self, model_uid: str) -> JSONResponse:
        try:
            event_collector_ref = await self._get_event_collector_ref()
            events = await event_collector_ref.get_model_events(model_uid)
            return JSONResponse(content=events)
        except ValueError as re:
            logger.error(re, exc_info=True)
            raise HTTPException(status_code=400, detail=str(re))
        except Exception as e:
            logger.error(e, exc_info=True)
            raise HTTPException(status_code=500, detail=str(e))

    async def list_vllm_supported_model_families(self) -> JSONResponse:
        try:
            from ..model.llm.vllm.core import (
                VLLM_SUPPORTED_CHAT_MODELS,
                VLLM_SUPPORTED_MODELS,
            )

            data = {
                "chat": VLLM_SUPPORTED_CHAT_MODELS,
                "generate": VLLM_SUPPORTED_MODELS,
            }
            return JSONResponse(content=data)
        except Exception as e:
            logger.error(e, exc_info=True)
            raise HTTPException(status_code=500, detail=str(e))

    async def get_cluster_device_info(
        self, detailed: bool = Query(False)
    ) -> JSONResponse:
        try:
            data = await (await self._get_supervisor_ref()).get_cluster_device_info(
                detailed=detailed
            )
            return JSONResponse(content=data)
        except Exception as e:
            logger.error(e, exc_info=True)
            raise HTTPException(status_code=500, detail=str(e))

    async def get_cluster_version(self) -> JSONResponse:
        try:
            data = get_versions()
            return JSONResponse(content=data)
        except Exception as e:
            logger.error(e, exc_info=True)
            raise HTTPException(status_code=500, detail=str(e))

    async def download_template(self, file_type: str, file_name: str) -> FileResponse:
        try:
            if file_type == "excel":
                if file_name == 'QA问答模板.xlsx':
                    file_path = "./xinference/factory/examples/QA问答模板.xlsx"
                elif file_name == '语料模板.xlsx':
                    file_path = "./xinference/factory/examples/语料模板.xlsx"
                return FileResponse(path=file_path,
                                    media_type="application/vnd.openxmlformats-officedocument.spreadsheetml.sheet")
            elif file_type == "json":
                if file_name == 'QA问答模板.json':
                    file_path = "./xinference/factory/examples/QA问答模板.json"
                elif file_name == '语料模板.json':
                    file_path = "./xinference/factory/examples/语料模板.json"
                return FileResponse(path=file_path,
                                    media_type="application/json")
        except FileNotFoundError:
            return {"error": "文件未找到"}

    async def list_dataset(self) -> JSONResponse:
        try:
            data = await self._dataset.list_dataset()
            return JSONResponse(content=data)
        except FileNotFoundError as fe:
            logger.error(fe)
            raise HTTPException(status_code=404, detail="Data file not found.")
        except ValueError as ve:
            logger.error(ve)
            raise HTTPException(status_code=400, detail="Invalid data format.")
        except Exception as e:
            logger.error(e)
            raise HTTPException(status_code=500, detail="Internal Server Error.")
    async def create_dataset(self, request: Request) -> JSONResponse:
        data = await request.json()
        dataset_name = data['dataset_name']
        dataset_type = data['dataset_type']
        dataset_desc = data['dataset_desc']
        dataset_tags = data['dataset_tags']
        try:
            await self._dataset.create_dataset(dataset_name, dataset_type, dataset_desc, dataset_tags)
            return JSONResponse(content=None)
        except FileNotFoundError as fe:
            logger.error(fe)
            raise HTTPException(status_code=404, detail="Data file not found.")
        except ValueError as ve:
            logger.error(ve)
            raise HTTPException(status_code=400, detail="Invalid data format.")
        except KeyError as ke:
            raise HTTPException(status_code=400, detail="数据集名称已存在")
        except Exception as e:
            logger.error(e)
            raise HTTPException(status_code=500, detail="Internal Server Error.")

    async def delete_dataset(self, request: Request) -> JSONResponse:
        data = await request.json()
        dataset_name = data['dataset_name']
        try:
            await self._dataset.delete_dataset(dataset_name)
            return JSONResponse(content=None)
        except FileNotFoundError as fe:
            logger.error(fe)
            raise HTTPException(status_code=404, detail="Data file not found.")
        except ValueError as ve:
            logger.error(ve)
            raise HTTPException(status_code=400, detail="Invalid data format.")
        except KeyError as ke:
            raise HTTPException(status_code=400, detail="数据集名称不存在")
        except Exception as e:
            logger.error(e)
            raise HTTPException(status_code=500, detail="Internal Server Error.")

    async def add_data(self, request: Request) -> JSONResponse:
        data = await request.json()
        dataset_name = data['dataset_name']
        data_list = data['data_list']
        try:
            await self._dataset.add_data(dataset_name, data_list)
            return JSONResponse(content=None)
        except FileNotFoundError as fe:
            logger.error(fe)
            raise HTTPException(status_code=404, detail="Data file not found.")
        except ValueError as ve:
            logger.error(ve)
            raise HTTPException(status_code=400, detail="Invalid data format.")
        except KeyError as ke:
            raise HTTPException(status_code=400, detail="数据集名称不存在")
        except Exception as e:
            logger.error(e)
            raise HTTPException(status_code=500, detail="Internal Server Error.")

    async def read_data(self, request: Request) -> JSONResponse:
        data = await request.json()
        dataset_name = data['dataset_name']
        page_num = data.get('page_num', 1)
        page_size = data.get('page_size', 5)
        keyword = data.get('keyword')
        if keyword == "" or keyword == " ":
            keyword = None
        try:
            data = await self._dataset.read_data(dataset_name, page_num, page_size, keyword)
            return JSONResponse(content=data)
        except FileNotFoundError as fe:
            logger.error(fe)
            raise HTTPException(status_code=404, detail="Data file not found.")
        except ValueError as ve:
            logger.error(ve)
            raise HTTPException(status_code=400, detail="Invalid data format.")
        except KeyError as ke:
            raise HTTPException(status_code=400, detail="数据集名称不存在")
        except Exception as e:
            logger.error(e)
            raise HTTPException(status_code=500, detail="Internal Server Error.")
    async def upload_data(self, dataset_name:str = Form(...), upload_file: UploadFile = File(...)) -> JSONResponse:
        import pandas as pd
        try:
            # 获取文件后缀
            file_extension = upload_file.filename.split('.')[-1].lower()
            # 初始化data_list
            data_list: List[Dict] = []
            if file_extension == 'xlsx' or file_extension == 'xls':
                # 处理Excel文件
                df = pd.read_excel(await upload_file.read())
                df.fillna('', inplace=True)
                data_list = df.to_dict(orient='records')
            elif file_extension == 'json':
                # 处理JSON文件
                contents = await upload_file.read()
                data_list = json.loads(contents.decode('utf-8'))
            else:
                raise ValueError(f"不支持的文件格式，仅支持Excel (.xlsx, .xls)和JSON。")

            # 检查data_list是否为空
            if not data_list:
                raise ValueError("上传的文件不包含任何数据")

            await self._dataset.add_data(dataset_name, data_list)
            return JSONResponse(content=None)

        except FileNotFoundError as fe:
            logger.error(fe)
            raise HTTPException(status_code=404, detail="Data file not found.")
        except ValueError as ve:
            logger.error(ve)
            raise HTTPException(status_code=400, detail="Invalid data format.")
        except KeyError as ke:
            raise HTTPException(status_code=400, detail="数据集名称不存在")
        except Exception as e:
            logger.error(e)
            raise HTTPException(status_code=500, detail="Internal Server Error.")

    async def training(self, request: Request) -> StreamingResponse:
        # 从请求体中获取参数
        params = await request.json()
        train_request = TrainRequest(**params)
        create_time = datetime.datetime.now().strftime('%Y-%m-%d-%H-%M-%S')
        basename = os.path.basename(train_request.model_name_or_path)
        output_dir = f"saves/{basename}/lora/train_{create_time}"

        # 设置环境变量
        os.environ['CUDA_VISIBLE_DEVICES'] = '1'
        os.environ['NCCL_P2P_DISABLE'] = '1'
        os.environ['NCCL_IB_DISABLE'] = '1'
        # 构建命令行参数
        command = [
            'llamafactory-cli', 'train',
            '--stage', train_request.stage,
            '--do_train', train_request.do_train,
            '--model_name_or_path', train_request.model_name_or_path,
            '--preprocessing_num_workers', train_request.preprocessing_num_workers,
            '--finetuning_type', train_request.finetuning_type,
            '--template', train_request.template,
            '--flash_attn', train_request.flash_attn,
            '--dataset_dir', train_request.dataset_dir,
            '--dataset', ','.join(train_request.dataset),
            '--cutoff_len', train_request.cutoff_len,
            '--learning_rate', train_request.learning_rate,
            '--num_train_epochs', train_request.num_train_epochs,
            '--max_samples', train_request.max_samples,
            '--per_device_train_batch_size', train_request.per_device_train_batch_size,
            '--gradient_accumulation_steps', train_request.gradient_accumulation_steps,
            '--lr_scheduler_type', train_request.lr_scheduler_type,
            '--max_grad_norm', train_request.max_grad_norm,
            '--logging_steps', train_request.logging_steps,
            '--save_steps', train_request.save_steps,
            '--warmup_steps', train_request.warmup_steps,
            '--optim', train_request.optim,
            '--packing', train_request.packing,
            '--report_to', train_request.report_to,
            '--output_dir', output_dir,
            '--fp16', train_request.fp16,
            '--plot_loss', train_request.plot_loss,
            '--lora_rank', train_request.lora_rank,
            '--lora_alpha', train_request.lora_alpha,
            '--lora_dropout', train_request.lora_dropout,
            '--lora_target', train_request.lora_target
        ]

        # 尝试执行命令行训练过程
        async def stream_output():
            try:
                global process
                # 启动进程
                process = await asyncio.create_subprocess_exec(
                    *command,
                    stdout=asyncio.subprocess.PIPE
                )
                discard = False
                while True:
                    try:
                        output = await asyncio.wait_for(process.stdout.readline(), timeout=1.0)
                        output = output.decode().strip()
                        if output:
                            if "'loss':" in output:
                                yield f"GRAPH: {output}<END>"
                            else:
                                yield f"OUT: {output}<END>"
                    except asyncio.TimeoutError:
                        # 超时后检查进程是否结束
                        if process.returncode is not None:
                            break
                    except asyncio.LimitOverrunError as e:
                        print(f"Overrun detected, buffer length now={e.consumed}")
                        chunk = await process.stdout.readexactly(e.consumed)
                        if not discard:
                            yield f"OUT:HUGE DATA {chunk}<END>"
                        discard = True

                    if process.returncode is not None:
                        break
                exit_code = await process.wait()
                print("训练执行完毕，退出码：", exit_code)
                if exit_code != 0:
                    raise HTTPException(status_code=500, detail="训练过程中发生错误。")

            except subprocess.CalledProcessError as cpe:
                logger.error(cpe.stderr)
                raise HTTPException(status_code=500, detail="An error occurred during training.")

            except asyncio.CancelledError:
                # 如果有取消信号（如Ctrl-C），杀死子进程
                process.terminate()
                raise HTTPException(status_code=500, detail="训练过程被用户终止。")

            except subprocess.CalledProcessError as cpe:
                logger.error(cpe.stderr)
                raise HTTPException(status_code=500, detail="An error occurred during training.")
            except FileNotFoundError as fe:
                logger.error(fe)
                raise HTTPException(status_code=404, detail="Data file not found.")
            except ValueError as ve:
                logger.error(ve)
                raise HTTPException(status_code=400, detail="输出显示出现错误")
            except Exception as e:
                logger.error(e)
                raise HTTPException(status_code=500, detail="Internal Server Error.")
            finally:
                process.terminate()

        return StreamingResponse(stream_output(), media_type="text/plain")

    async def advanced_training(self, request: Request) -> StreamingResponse:
        # 从请求体中获取参数
        params = await request.json()
        create_time = datetime.datetime.now().strftime('%Y-%m-%d-%H-%M-%S')
        basename = os.path.basename(params['model_name_or_path'])
        output_dir = f"saves/{basename}/lora/train_{create_time}"

        def dict_to_command_list(dictionary, output_dir, prefix='--'):
            command_list = ['llamafactory-cli', 'train']
            for key, value in dictionary.items():
                command_list.append(prefix + key)
                command_list.append(str(value))
            command_list.append('--output_dir')
            command_list.append(output_dir)
            return command_list

        command = dict_to_command_list(params, output_dir)

        # 设置环境变量
        os.environ['CUDA_VISIBLE_DEVICES'] = '1'
        os.environ['NCCL_P2P_DISABLE'] = '1'
        os.environ['NCCL_IB_DISABLE'] = '1'

        # 尝试执行命令行训练过程
        async def stream_output():
            try:
                global process
                # 启动进程
                process = await asyncio.create_subprocess_exec(
                    *command,
                    stdout=asyncio.subprocess.PIPE
                )
                discard = False
                while True:
                    try:
                        output = await asyncio.wait_for(process.stdout.readline(), timeout=1.0)
                        output = output.decode().strip()
                        if output:
                            if "'loss':" in output:
                                yield f"GRAPH: {output}<END>"
                            else:
                                yield f"OUT: {output}<END>"
                    except asyncio.TimeoutError:
                        # 超时后检查进程是否结束
                        if process.returncode is not None:
                            break
                    except asyncio.LimitOverrunError as e:
                        print(f"Overrun detected, buffer length now={e.consumed}")
                        chunk = await process.stdout.readexactly(e.consumed)
                        if not discard:
                            yield f"OUT:HUGE DATA {chunk}<END>"
                        discard = True

                    if process.returncode is not None:
                        break
                exit_code = await process.wait()
                print("训练执行完毕，退出码：", exit_code)
                if exit_code != 0:
                    raise HTTPException(status_code=500, detail="训练过程中发生错误。")

            except subprocess.CalledProcessError as cpe:
                logger.error(cpe.stderr)
                raise HTTPException(status_code=500, detail="An error occurred during training.")

            except asyncio.CancelledError:
                # 如果有取消信号（如Ctrl-C），杀死子进程
                process.terminate()
                raise HTTPException(status_code=500, detail="训练过程被用户终止。")

            except subprocess.CalledProcessError as cpe:
                logger.error(cpe.stderr)
                raise HTTPException(status_code=500, detail="An error occurred during training.")
            except FileNotFoundError as fe:
                logger.error(fe)
                raise HTTPException(status_code=404, detail="Data file not found.")
            except ValueError as ve:
                logger.error(ve)
                raise HTTPException(status_code=400, detail="输出显示出现错误")
            except Exception as e:
                logger.error(e)
                raise HTTPException(status_code=500, detail="Internal Server Error.")
            finally:
                process.terminate()

        return StreamingResponse(stream_output(), media_type="text/plain")

    async def terminate(self) -> JSONResponse:
        try:
            process.terminate()
            return JSONResponse(content={"info":"训练进程已停止"})
        except Exception as e:
            logger.error(e)
            raise HTTPException(status_code=500, detail="Internal Server Error.")

    async def list_logs(self) -> JSONResponse:
        try:
            directory = 'saves/'
            file_paths = []
            if os.path.exists(directory):
                folders = ['lora', 'full', 'freeze']
                for model in os.listdir(directory):
                    for folder in folders:
                        folder_path = os.path.join(directory+model, folder)
                        if os.path.exists(folder_path):
                            data = await (await self._get_supervisor_ref()).get_model_registration(
                                "LLM", model
                            )
                            file_paths.append({
                                "name": model,
                                "info": data,
                                "path": []
                            })
                            for file_name in os.listdir(folder_path):
                                file_paths[-1]["path"].append(os.path.join(folder, file_name))
            return JSONResponse(content={"model_list":file_paths})
        except FileNotFoundError as fe:
            logger.error(fe)
            raise HTTPException(status_code=404, detail="Data file not found.")
        except ValueError as ve:
            logger.error(ve)
            raise HTTPException(status_code=400, detail="Invalid data format.")
        except Exception as e:
            logger.error(e)
            raise HTTPException(status_code=500, detail="Internal Server Error.")

    async def get_logs(self, name: str) -> JSONResponse:
        try:
            trainer_log = os.path.join('saves/'+name, "trainer_log.jsonl")
            all_results = os.path.join('saves/'+name, "all_results.json")
            if os.path.exists(trainer_log):
                with open(trainer_log, 'r') as file:
                    trainer_log = file.read()
            if os.path.exists(all_results):
                with open(all_results, 'r') as file:
                    all_results = file.read()
            if all_results:
                all_results = json.loads(all_results)
            if trainer_log:
                trainer_log = [json.loads(line) for line in trainer_log.split("\n") if line]
            if trainer_log and all_results:
                return JSONResponse(content={"trainer_log":trainer_log, "all_results":all_results})
            else:
                raise HTTPException(status_code=404, detail="日志信息为空")
        except FileNotFoundError as fe:
            logger.error(fe)
            raise HTTPException(status_code=404, detail="日志未找到")
        except json.JSONDecodeError:
            raise HTTPException(status_code=400, detail="日志信息有误")


def run(
    supervisor_address: str,
    host: str,
    port: int,
    logging_conf: Optional[dict] = None,
    auth_config_file: Optional[str] = None,
):
    logger.info(f"Starting Xinference at endpoint: http://{host}:{port}")
    try:
        api = RESTfulAPI(
            supervisor_address=supervisor_address,
            host=host,
            port=port,
            auth_config_file=auth_config_file,
        )
        api.serve(logging_conf=logging_conf)
    except SystemExit:
        logger.warning("Failed to create socket with port %d", port)
        # compare the reference to differentiate between the cases where the user specify the
        # default port and the user does not specify the port.
        if port is XINFERENCE_DEFAULT_ENDPOINT_PORT:
            port = get_next_port()
            logger.info(f"Found available port: {port}")
            logger.info(f"Starting Xinference at endpoint: http://{host}:{port}")
            api = RESTfulAPI(
                supervisor_address=supervisor_address,
                host=host,
                port=port,
                auth_config_file=auth_config_file,
            )
            api.serve(logging_conf=logging_conf)
        else:
            raise


def run_in_subprocess(
    supervisor_address: str,
    host: str,
    port: int,
    logging_conf: Optional[dict] = None,
    auth_config_file: Optional[str] = None,
) -> multiprocessing.Process:
    p = multiprocessing.Process(
        target=run,
        args=(supervisor_address, host, port, logging_conf, auth_config_file),
    )
    p.daemon = True
    p.start()
    return p
