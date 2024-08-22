import {
    Box,
    Button,
    FormControl,
    Grid,
    Select,
    InputLabel,
    MenuItem,
    TextField,
    OutlinedInput,
    ListItemText,
    FormControlLabel,
    FormLabel,
    RadioGroup,
    Radio,
    Slider,
    Input,
    FormHelperText,
    List,
    ListItem,
    ListItemIcon,
    Paper,
    Dialog,
    DialogTitle,
    DialogContent,
    DialogContentText,
    DialogActions
} from '@mui/material'
import React, {useContext, useEffect, useRef, useState} from 'react'
import {useCookies} from 'react-cookie'
import {useNavigate, useParams, useSearchParams} from 'react-router-dom'
import CancelIcon from '@mui/icons-material/Cancel';
import RocketLaunchIcon from '@mui/icons-material/RocketLaunch';
import {ApiContext} from '../../components/apiContext'
import ErrorMessageSnackBar from '../../components/errorMessageSnackBar'
import fetcher from '../../components/fetcher'
import Title from '../../components/Title'
import Checkbox from '@mui/material/Checkbox';
import Typography from "@mui/material/Typography";
import FileDownloadDoneIcon from "@mui/icons-material/FileDownloadDone";
import {LoadingButton} from "@mui/lab";


const TestDetail = () => {
    const {id} = useParams();
    const name = id;
    let [searchParams] = useSearchParams();
    let path = searchParams.get("path");
    console.log(path)
    console.log(id)
    const ITEM_HEIGHT = 48;
    const ITEM_PADDING_TOP = 8;
    const MenuProps = {
        PaperProps: {
            style: {
                maxHeight: ITEM_HEIGHT * 4.5 + ITEM_PADDING_TOP,
                width: 250,
            },
        },
    };
    let endPoint = useContext(ApiContext).endPoint
    // const parentRef = useRef(null)
    const {isCallingApi, setIsCallingApi} = useContext(ApiContext)
    const {isUpdatingModel, setIsUpdatingModel} = useContext(ApiContext)
    const {setErrorMsg} = useContext(ApiContext)
    const [cookie] = useCookies(['token'])
    const navigate = useNavigate()
    //微调方法类型
    const finetuningTypeOptions = [{name: 'full', value: 'full'}, {name: 'freeze', value: 'freeze'}, {name: 'lora',value: 'lora'}]
    //微调方法
    const [finetuning_type, setFinetuning_type] = useState('lora')
    //模型路径
    const [model_path, setModel_path] = useState('saves/'+name+'/'+path)
    //训练阶段选项
    const trainingStageOptions = [{name: 'Supervised Fine-Tuning', value: 'sft'}, {name: 'Reward Modeling',value: 'rm'}, {name: 'PPO', value: 'ppo'}, {name: 'DPO', value: 'dpo'}, {name: 'ORPO', value: 'orpo'}, {name: 'Pre-Training', value: 'pt'}]
    //训练阶段
    const [training_stage, setTraining_stage] = useState('sft')
    //提示模版选项
    const templateDatas = [
        {"model": "Baichuan-7B-Base", "template": "baichuan"},
        {"model": "Baichuan-13B-Base", "template": "baichuan"},
        {"model": "Baichuan-13B-Chat", "template": "baichuan"},
        {"model": "Baichuan2-7B-Base", "template": "baichuan2"},
        {"model": "Baichuan2-13B-Base", "template": "baichuan2"},
        {"model": "Baichuan2-7B-Chat", "template": "baichuan2"},
        {"model": "Baichuan2-13B-Chat", "template": "baichuan2"},
        {"model": "BLOOM-560M", "template": "default"},
        {"model": "BLOOM-3B", "template": "default"},
        {"model": "BLOOM-7B1", "template": "default"},
        {"model": "BLOOMZ-560M", "template": "default"},
        {"model": "BLOOMZ-3B", "template": "default"},
        {"model": "BLOOMZ-7B1-mt", "template": "default"},
        {"model": "BlueLM-7B-Base", "template": "bluelm"},
        {"model": "BlueLM-7B-Chat", "template": "bluelm"},
        {"model": "Breeze-7B", "template": "breeze"},
        {"model": "Breeze-7B-Chat", "template": "breeze"},
        {"model": "ChatGLM2-6B-Chat", "template": "chatglm2"},
        {"model": "ChatGLM3-6B-Base", "template": "chatglm3"},
        {"model": "ChatGLM3-6B-Chat", "template": "chatglm3"},
        {"model": "ChineseLLaMA2-1.3B", "template": "llama2_zh"},
        {"model": "ChineseLLaMA2-7B", "template": "llama2_zh"},
        {"model": "ChineseLLaMA2-13B", "template": "llama2_zh"},
        {"model": "ChineseLLaMA2-1.3B-Chat", "template": "llama2_zh"},
        {"model": "ChineseLLaMA2-7B-Chat", "template": "llama2_zh"},
        {"model": "ChineseLLaMA2-13B-Chat", "template": "llama2_zh"},
        {"model": "CommandR-35B-Chat", "template": "default"},
        {"model": "CommandR-Plus-104B-Chat", "template": "default"},
        {"model": "CommandR-35B-4bit-Chat", "template": "default"},
        {"model": "CommandR-Plus-104B-4bit-Chat", "template": "default"},
        {"model": "DBRX-132B-Base", "template": "dbrx"},
        {"model": "DBRX-132B-Chat", "template": "dbrx"},
        {"model": "DeepSeek-LLM-7B-Base", "template": "deepseek"},
        {"model": "DeepSeek-LLM-67B-Base", "template": "deepseek"},
        {"model": "DeepSeek-LLM-7B-Chat", "template": "deepseek"},
        {"model": "DeepSeek-LLM-67B-Chat", "template": "deepseek"},
        {"model": "DeepSeek-Math-7B-Base", "template": "deepseek"},
        {"model": "DeepSeek-Math-7B-Chat", "template": "deepseek"},
        {"model": "DeepSeek-MoE-16B-Base", "template": "deepseek"},
        {"model": "DeepSeek-MoE-236B-Base", "template": "deepseek"},
        {"model": "DeepSeek-MoE-16B-Chat", "template": "deepseek"},
        {"model": "DeepSeek-MoE-236B-Chat", "template": "deepseek"},
        {"model": "DeepSeekCoder-6.7B-Base", "template": "deepseekcoder"},
        {"model": "DeepSeekCoder-7B-Base", "template": "deepseekcoder"},
        {"model": "DeepSeekCoder-33B-Base", "template": "deepseekcoder"},
        {"model": "DeepSeekCoder-6.7B-Chat", "template": "deepseekcoder"},
        {"model": "DeepSeekCoder-7B-Chat", "template": "deepseekcoder"},
        {"model": "DeepSeekCoder-33B-Chat", "template": "deepseekcoder"},
        {"model": "Falcon-7B", "template": "falcon"},
        {"model": "Falcon-40B", "template": "falcon"},
        {"model": "Falcon-180B", "template": "falcon"},
        {"model": "Falcon-7B-Chat", "template": "falcon"},
        {"model": "Falcon-40B-Chat", "template": "falcon"},
        {"model": "Falcon-180B-Chat", "template": "falcon"},
        {"model": "Gemma-2B", "template": "gemma"},
        {"model": "Gemma-7B", "template": "gemma"},
        {"model": "Gemma-2B-Chat", "template": "gemma"},
        {"model": "Gemma-7B-Chat", "template": "gemma"},
        {"model": "CodeGemma-2B", "template": "gemma"},
        {"model": "CodeGemma-7B", "template": "gemma"},
        {"model": "CodeGemma-7B-Chat", "template": "gemma"},
        {"model": "InternLM-7B", "template": "intern"},
        {"model": "InternLM-20B", "template": "intern"},
        {"model": "InternLM-7B-Chat", "template": "intern"},
        {"model": "InternLM-20B-Chat", "template": "intern"},
        {"model": "InternLM2-7B", "template": "intern2"},
        {"model": "InternLM2-20B", "template": "intern2"},
        {"model": "InternLM2-7B-Chat", "template": "intern2"},
        {"model": "InternLM2-20B-Chat", "template": "intern2"},
        {"model": "Jambda-v0.1", "template": "default"},
        {"model": "LingoWhale-8B", "template": "default"},
        {"model": "LLaMA-7B", "template": "default"},
        {"model": "LLaMA-13B", "template": "default"},
        {"model": "LLaMA-30B", "template": "default"},
        {"model": "LLaMA-65B", "template": "default"},
        {"model": "LLaMA2-7B", "template": "llama2"},
        {"model": "LLaMA2-13B", "template": "llama2"},

        {"model": "LLaMA2-70B", "template": "llama2"},
        {"model": "LLaMA2-7B-Chat", "template": "llama2"},
        {"model": "LLaMA2-13B-Chat", "template": "llama2"},
        {"model": "LLaMA2-70B-Chat", "template": "llama2"},
        {"model": "LLaMA3-8B", "template": "llama3"},
        {"model": "LLaMA3-70B", "template": "llama3"},
        {"model": "LLaMA3-8B-Chat", "template": "llama3"},
        {"model": "LLaMA3-70B-Chat", "template": "llama3"},
        {"model": "LLaMA3-8B-Chinese-Chat", "template": "llama2_zh"},
        {"model": "LLaMA3-70B-Chinese-Chat", "template": "llama2_zh"},
        {"model": "LLaVA1.5-7B-Chat", "template": "default"},
        {"model": "LLaVA1.5-13B-Chat", "template": "default"},
        {"model": "Mistral-7B-v0.1", "template": "mistral"},
        {"model": "Mistral-7B-v0.1-Chat", "template": "mistral"},
        {"model": "Mistral-7B-v0.2", "template": "mistral"},
        {"model": "Mistral-7B-v0.2-Chat", "template": "mistral"},
        {"model": "Mixtral-8x7B-v0.1", "template": "default"},
        {"model": "Mixtral-8x7B-v0.1-Chat", "template": "default"},
        {"model": "Mixtral-8x22B-v0.1", "template": "default"},
        {"model": "Mixtral-8x22B-v0.1-Chat", "template": "default"},
        {"model": "OLMo-1B", "template": "olmo"},
        {"model": "OLMo-7B", "template": "olmo"},
        {"model": "OLMo-1.7-7B", "template": "olmo"},
        {"model": "OpenChat3.5-7B-Chat", "template": "openchat"},
        {"model": "Orion-14B-Base", "template": "orion"},
        {"model": "Orion-14B-Chat", "template": "orion"},
        {"model": "Orion-14B-Long-Chat", "template": "orion"},
        {"model": "Orion-14B-RAG-Chat", "template": "orion"},
        {"model": "Orion-14B-Plugin-Chat", "template": "orion"},
        {"model": "Phi-1.5-1.3B", "template": "phi"},
        {"model": "Phi-2-2.7B", "template": "phi"},
        {"model": "Phi3-3.8B-4k-Chat", "template": "phi"},
        {"model": "Phi3-3.8B-128k-Chat", "template": "phi"},
        {"model": "Qwen-1.8B", "template": "qwen"},
        {"model": "Qwen-7B", "template": "qwen"},
        {"model": "Qwen-14B", "template": "qwen"},
        {"model": "Qwen-72B", "template": "qwen"},
        {"model": "Qwen-1.8B-Chat", "template": "qwen"},
        {"model": "Qwen-7B-Chat", "template": "qwen"},
        {"model": "Qwen-14B-Chat", "template": "qwen"},
        {"model": "Qwen-72B-Chat", "template": "qwen"},
        {"model": "Qwen-1.8B-int8-Chat", "template": "qwen"},
        {"model": "Qwen-1.8B-int4-Chat", "template": "qwen"},
        {"model": "Qwen-7B-int8-Chat", "template": "qwen"},
        {"model": "Qwen-7B-int4-Chat", "template": "qwen"},
        {"model": "Qwen-14B-int8-Chat", "template": "qwen"},
        {"model": "Qwen-14B-int4-Chat", "template": "qwen"},
        {"model": "Qwen-72B-int8-Chat", "template": "qwen"},
        {"model": "Qwen-72B-int4-Chat", "template": "qwen"},
        {"model": "Qwen1.5-0.5B", "template": "qwen"},
        {"model": "Qwen1.5-1.8B", "template": "qwen"},
        {"model": "Qwen1.5-4B", "template": "qwen"},
        {"model": "Qwen1.5-7B", "template": "qwen"},
        {"model": "Qwen1.5-14B", "template": "qwen"},
        {"model": "Qwen1.5-32B", "template": "qwen"},
        {"model": "Qwen1.5-72B", "template": "qwen"},
        {"model": "Qwen1.5-110B", "template": "qwen"},
        {"model": "Qwen1.5-MoE-A2.7B", "template": "qwen"},
        {"model": "Qwen1.5-Code-7B", "template": "qwen"},
        {"model": "Qwen1.5-0.5B-Chat", "template": "qwen"},
        {"model": "Qwen1.5-1.8B-Chat", "template": "qwen"},
        {"model": "Qwen1.5-4B-Chat", "template": "qwen"},
        {"model": "Qwen1.5-7B-Chat", "template": "qwen"},
        {"model": "Qwen1.5-14B-Chat", "template": "qwen"},
        {"model": "Qwen1.5-32B-Chat", "template": "qwen"},
        {"model": "Qwen1.5-72B-Chat", "template": "qwen"},
        {"model": "Qwen1.5-110B-Chat", "template": "qwen"},
        {"model": "Qwen1.5-MoE-A2.7B-Chat", "template": "qwen"},
        {"model": "Qwen1.5-Code-7B-Chat", "template": "qwen"},
        {"model": "Qwen1.5-0.5B-int8-Chat", "template": "qwen"},
        {"model": "Qwen1.5-0.5B-int4-Chat", "template": "qwen"},
        {"model": "Qwen1.5-1.8B-int8-Chat", "template": "qwen"},
        {"model": "Qwen1.5-1.8B-int4-Chat", "template": "qwen"},
        {"model": "Qwen1.5-4B-int8-Chat", "template": "qwen"},
        {"model": "Qwen1.5-4B-int4-Chat", "template": "qwen"},
        {"model": "Qwen1.5-7B-int8-Chat", "template": "qwen"},
        {"model": "Qwen1.5-7B-int4-Chat", "template": "qwen"},
        {"model": "Qwen1.5-14B-int8-Chat", "template": "qwen"},
        {"model": "Qwen1.5-14B-int4-Chat", "template": "qwen"},
        {"model": "Qwen1.5-32B-int4-Chat", "template": "qwen"},
        {"model": "Qwen1.5-72B-int8-Chat", "template": "qwen"},
        {"model": "Qwen1.5-72B-int4-Chat", "template": "qwen"},
        {"model": "Qwen1.5-110B-int4-Chat", "template": "qwen"},
        {"model": "Qwen1.5-MoE-A2.7B-int4-Chat", "template": "qwen"},
        {"model": "Qwen1.5-Code-7B-int4-Chat", "template": "qwen"},
        {"model": "SOLAR-10.7B", "template": "solar"},
        {"model": "SOLAR-10.7B-Chat", "template": "solar"},
        {"model": "Skywork-13B-Base", "template": "default"},
        {"model": "StarCoder2-3B", "template": "default"},
        {"model": "StarCoder2-7B", "template": "default"},
        {"model": "StarCoder2-15B", "template": "default"},
        {"model": "Vicuna1.5-7B-Chat", "template": "vicuna"},
        {"model": "Vicuna1.5-13B-Chat", "template": "vicuna"},
        {"model": "XuanYuan-6B", "template": "xuanyuan"},
        {"model": "XuanYuan-70B", "template": "xuanyuan"},
        {"model": "XuanYuan-2-70B", "template": "xuanyuan"},
        {"model": "XuanYuan-6B-Chat", "template": "xuanyuan"},
        {"model": "XuanYuan-70B-Chat", "template": "xuanyuan"},
        {"model": "XuanYuan-2-70B-Chat", "template": "xuanyuan"},
        {"model": "XuanYuan-6B-int8-Chat", "template": "xuanyuan"},
        {"model": "XuanYuan-6B-int4-Chat", "template": "xuanyuan"},
        {"model": "XuanYuan-70B-int8-Chat", "template": "xuanyuan"},
        {"model": "XuanYuan-70B-int4-Chat", "template": "xuanyuan"},
        {"model": "XuanYuan-2-70B-int8-Chat", "template": "xuanyuan"},
        {"model": "XuanYuan-2-70B-int4-Chat", "template": "xuanyuan"},
        {"model": "XVERSE-7B", "template": "xverse"},
        {"model": "XVERSE-13B", "template": "xverse"},
        {"model": "XVERSE-65B", "template": "xverse"},
        {"model": "XVERSE-65B-2", "template": "xverse"},
        {"model": "XVERSE-7B-Chat", "template": "xverse"},
        {"model": "XVERSE-13B-Chat", "template": "xverse"},
        {"model": "XVERSE-65B-Chat", "template": "xverse"},
        {"model": "XVERSE-MoE-A4.2B", "template": "xverse"},
        {"model": "XVERSE-7B-int8-Chat", "template": "xverse"},
        {"model": "XVERSE-7B-int4-Chat", "template": "xverse"},
        {"model": "XVERSE-13B-int8-Chat", "template": "xverse"},
        {"model": "XVERSE-13B-int4-Chat", "template": "xverse"},
        {"model": "XVERSE-65B-int4-Chat", "template": "xverse"},
        {"model": "Yayi-7B", "template": "yayi"},
        {"model": "Yayi-13B", "template": "yayi"},
        {"model": "Yi-6B", "template": "yi"},
        {"model": "Yi-9B", "template": "yi"},
        {"model": "Yi-34B", "template": "yi"},
        {"model": "Yi-6B-Chat", "template": "yi"},
        {"model": "Yi-34B-Chat", "template": "yi"},
        {"model": "Yi-6B-int8-Chat", "template": "yi"},
        {"model": "Yi-6B-int4-Chat", "template": "yi"},
        {"model": "Yi-34B-int8-Chat", "template": "yi"},
        {"model": "Yi-34B-int4-Chat", "template": "yi"},
        {"model": "Yi-1.5-6B", "template": "yi"},
        {"model": "Yi-1.5-9B", "template": "yi"},
        {"model": "Yi-1.5-34B", "template": "yi"},
        {"model": "Yi-1.5-6B-Chat", "template": "yi"},
        {"model": "Yi-1.5-9B-Chat", "template": "yi"},
        {"model": "Yi-1.5-34B-Chat", "template": "yi"},
        {"model": "YiVL-6B-Chat", "template": "yi_vl"},
        {"model": "YiVL-34B-Chat", "template": "yi_vl"},
        {"model": "Yuan2-2B-Chat", "template": "yuan"},
        {"model": "Yuan2-51B-Chat", "template": "yuan"},
        {"model": "Yuan2-102B-Chat", "template": "yuan"},
        {"model": "Zephyr-7B-Alpha-Chat", "template": "zephyr"},
        {"model": "Zephyr-7B-Beta-Chat", "template": "zephyr"},
        {"model": "Zephyr-141B-ORPO-Chat", "template": "zephyr"},
        {"model": "Custom", "template": "default"}
    ]
    const [templateOptions, setTemplateOptions] = useState([])
    //提示模版
    const [template, setTemplate] = useState('')
    //ROPE插值方法
    const [rope_scaling, setRope_scaling] = useState('linear')
    //加速方式
    const [booster, setBooster] = useState('none')
    //显卡序号
    const [cardNO, setCardNO] = useState('1')
    //数据路径
   const dataset_dir = './xinference/factory/data/'
    //数据集集合
    const [datasetList, setDatasetList] = useState([]);
    //数据集
    const [dataset, setDataset] = useState([])
    //截断长度
    const [cutoff_len, setCutoff_len] = useState(1024);
    //最大样本数
    const [max_samples, setMax_samples] = useState(100000);
    //批处理大小
    const [batch_size, setBatch_size] = useState('2')
    //保存预测结果
    const [predict, setPredict] = useState(true);
    //最大生成长度
    const [max_new_tokens, setMax_new_tokens] = useState(512);
    //Top-p采样值
    const [top_p, setTop_p] = useState(0.7);
    //温度系数
    const [temperature, setTemperature] = useState(0.95);

    //新增数据是否显示抽屉
    //const [isShow, setIsShow] = useState(false)
    const [isEnable, setIsEnable] = useState(false);
        //是否显示Confirm框
    const [isShowConfirm, setIsShowConfirm] = useState(false)
    //确认类型：1 开始训练 2 中止训练
    const [confirmType,setConfirmType]=useState(1)
    const [loading, setLoading] = useState(false)
    const [returnContent, setReturnContent] = useState([])
    const listRef = useRef(null); // 创建一个ref来引用<ul>
    //预览数据集
    // const handleViewDataset = () => {
    //     setIsShow(true)
    // }

    const handleStopTrain = () => {
        setIsEnable(false);
    }
    const handleCheckBoxChange = (e) => {
        setPredict(e.target.checked)
    }
    //关闭数据集预览
    // const handleClose = () => {
    //     setIsShow(false)
    // }

    const update = (isCallingApi) => {
        if (cookie.token === '' || cookie.token === undefined) {
            return
        }
        if (cookie.token !== 'no_auth' && !sessionStorage.getItem('token')) {
            navigate('/login', {replace: true})
            return
        }
        if (isCallingApi) {
            setDatasetList([{name: 'Loading, do not refresh page...', value: 'IS_LOADING'}])
        } else {
            setIsUpdatingModel(true)
            fetcher(`${endPoint}/v1/dataset/list_dataset`, {
                method: 'GET',
            })
                .then((response) => {
                    if (!response.ok) {
                        response.json().then((errorData) => {
                            setErrorMsg(
                                `Login failed: ${response.status} - ${
                                    errorData.detail || 'Unknown error'
                                }`
                            )
                        })
                    } else {
                        response.json().then((response) => {
                            const list = JSON.parse(response);
                            const tempList = [];
                            list.forEach((item) => {
                                tempList.push({name: item.dataset_name, value: item.dataset_name});
                            })
                            setDatasetList(tempList);
                            setIsUpdatingModel(false)
                        })
                    }
                })
                .catch((error) => {
                    console.error('Error:', error)
                    setIsUpdatingModel(false)
                })
        }
    }

    useEffect(() => {
        update(isCallingApi)
        // eslint-disable-next-line
    }, [isCallingApi, cookie.token])


    useEffect(() => {
        if (cookie.token === '' || cookie.token === undefined) {
            return
        }
        if (cookie.token !== 'no_auth' && !sessionStorage.getItem('token')) {
            navigate('/login', {replace: true})
            return
        }
    }, [cookie.token])
    const goBack = () => {
        navigate('/test_model/llm')
    }
    useEffect(() => {
        const arr = [];
        templateDatas.forEach(function (cur) {
            const tempArr = arr.filter(function (subCur) {
                return subCur.name == cur.template;
            })
            if (tempArr.length == 0)
                arr.push({name: cur.template, value: cur.template})
        })
        setTemplateOptions(arr);
        const templateFilter = templateDatas.filter(function (cur) {
            return name.toLowerCase().indexOf(cur.template) >= 0;
        })
        if (templateFilter.length > 0)
            setTemplate(templateFilter[templateFilter.length - 1].template)
    }, []);
    // const descriptionElementRef = React.useRef(null);
    // useEffect(() => {
    //     if (isShow) {
    //         const {current: descriptionElement} = descriptionElementRef;
    //         if (descriptionElement !== null) {
    //             descriptionElement.focus();
    //         }
    //     }
    // }, [isShow]);

    //关闭确认
    const handleClose = (e) => {
        e.stopPropagation()
        setIsShowConfirm(false)
    }
      const handleConfirm = (e) => {
        e.stopPropagation()
          setIsShowConfirm(false)
          if(confirmType==1)
          {
              handleTrainModel()
          }
          else if(confirmType==2){
              handleStopTrain()
          }
    }
        //模型训练
       const handleTrainModel = () => {
        if (isCallingApi || isUpdatingModel)
            return
        setIsEnable(true);
        setLoading(true)
        try {
            setIsCallingApi(true)
            // setDataset_dir('./xinference/factory/data/')//固定值
            const postData = {};
            postData.predict_with_generate = 'True'
            postData.preprocessing_num_workers='16'
            postData.finetuning_type = finetuning_type//微调方法
            postData.stage = training_stage//训练阶段
            postData.template = template//提示模版
            postData.model_name_or_path = 'models/'+name//基模型名称
            postData.output_dir=model_path//训练模型名称
            postData.dataset_dir = dataset_dir//数据路径
            postData.CUDA_VISIBLE_DEVICES=cardNO//显卡序号,多张显卡用,分割拼接
            if (rope_scaling != 'none')
                postData.rope_scaling = rope_scaling//RoPE 插值方法
            if (booster != 'none')
                postData.flash_attn = booster//加速方式
            else
                postData.flash_attn = 'auto'//加速方式
            if (booster == 'unsloth')
                postData.use_unsloth = 'True'//如果加速方式是unsloth
            postData.cutoff_len = cutoff_len//截断长度
            postData.per_device_eval_batch_size=batch_size//批处理大小
            postData.max_samples = max_samples//最大样本数
            postData.max_new_tokens=max_new_tokens//最大生成长度
            postData.top_p=top_p//Top_p 采样值
            postData.temperature=temperature//温度系数
            postData.dataset = dataset.join(',')//数据集
            if(predict)
                postData.do_predict='True'
            else
                postData.do_eval='True'


            console.log(postData)
            fetcher(`${endPoint}/v1/runner/advanced_training`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(postData)
            }).then((response) => {
                setLoading(false)
                if (!response.ok) {
                    response
                        .json()
                        .then((errData) =>
                            setErrorMsg(
                                `Server error: ${response.status} - ${
                                    errData.detail || 'Unknown error'
                                }`
                            )
                        )
                } else {
                    const reader = response.body.getReader();
                    const decoder = new TextDecoder();
                   // let content = '';
                    setReturnContent([])
                    const read = () => {
                        reader.read().then(({done, value}) => {
                            if (done) {
                                // 当读取完成时，设置数据并关闭读取器
                                return reader.releaseLock();
                            }
                            // 将读取到的 Uint8Array 转换为字符串
                            const lineText = decoder.decode(value, {stream: true});
                            const tempArr = lineText.split('<END>').filter(function (cur) {
                                return cur.length > 0;
                            });
                            setReturnContent(preItems => [...preItems, ...tempArr])
                            read(); // 继续读取直到完成
                        });
                    };
                    read();
                }
            })
        } catch (error) {
            console.error('Error:', error)
        } finally {
            setIsCallingApi(false)
        }
    }
    return (
        <Box m="20px">
            <div style={{display: 'flex'}}>
                <div style={{cursor: 'pointer'}} onClick={goBack}><Title title={'模型测试 / '}/></div>
                <Title title={' ' + name} color="text.primary"/>
            </div>
            <ErrorMessageSnackBar/>
            <Box
                sx={{
                    height: '100%',
                    width: '100%',
                    paddingLeft: '20px',
                    paddingTop: '20px',
                }}
            >
                <Box sx={{height: '100%', width: '100%', flexGrow: 1}}>
                     <Paper elevation={2} style={{padding: "20px"}}>
                        <Grid container spacing={1}>
                        <Grid item xs={3}>
                            <FormControl variant="outlined" margin="dense" fullWidth>
                                <InputLabel id="finetuning_type-label">微调方法</InputLabel>
                                <Select
                                    labelId="finetuning_type-label"
                                    value={finetuning_type}
                                    onChange={(e) => setFinetuning_type(e.target.value)}
                                    label="微调方法"
                                    size="small"
                                >
                                    {finetuningTypeOptions.map((item) => {
                                        return (
                                            <MenuItem key={item.value} value={item.value}>
                                                {item.name}
                                            </MenuItem>
                                        )
                                    })}
                                </Select>
                            </FormControl>
                        </Grid>
                        <Grid item xs={3}>
                            <FormControl variant="outlined" margin="dense" fullWidth>
                                <InputLabel id="quantization_bit-label">训练阶段</InputLabel>
                                <Select
                                    labelId="training_stage-label"
                                    value={training_stage}
                                    onChange={(e) => setTraining_stage(e.target.value)}
                                    label="训练阶段"
                                    helperText="目前采用的训练方式"
                                    size="small"
                                >
                                    {trainingStageOptions.map((item) => {
                                        return (
                                            <MenuItem key={item.value} value={item.value}>
                                                {item.name}
                                            </MenuItem>
                                        )
                                    })}
                                </Select>
                            </FormControl>
                        </Grid>
                        <Grid item xs={6}>
                            <FormControl variant="outlined" margin="dense" fullWidth>
                                <TextField
                                    label="模型路径"
                                    value={model_path}
                                    helperText="本地模型的文件路径"
                                    onChange={(e) => setModel_path(e.target.value)}
                                    size="small"
                                />
                            </FormControl>
                        </Grid>

                        {/*<Grid item xs={3}>*/}
                        {/*    <FormControl variant="outlined" margin="normal" fullWidth>*/}
                        {/*        <TextField*/}
                        {/*            label="数据路径"*/}
                        {/*            value={dataset_dir}*/}
                        {/*            helperText="数据文件夹的路径"*/}
                        {/*            onChange={(e) => setDataset_dir(e.target.value)}*/}
                        {/*            size="small"*/}
                        {/*        />*/}
                        {/*    </FormControl>*/}
                        {/*</Grid>*/}
                        <Grid item xs={3}>
                            <FormControl variant="outlined" margin="dense" fullWidth>
                                <InputLabel id="template-label">提示模板</InputLabel>
                                <Select
                                    labelId="template-label"
                                    value={template}
                                    onChange={(e) => setTemplate(e.target.value)}
                                    label="提示模板"
                                    size="small"
                                >
                                    {templateOptions.map((item) => {
                                        return (
                                            <MenuItem key={item.value} value={item.value}>
                                                {item.name}
                                            </MenuItem>
                                        )
                                    })}
                                </Select>
                            </FormControl>
                        </Grid>
                        <Grid item xs={3}>
                            <FormControl variant="outlined" margin="dense" fullWidth>
                                <TextField
                                    label="显卡序号"
                                    value={cardNO}
                                    helperText="输入显卡序号，多张显卡,分割"
                                    onChange={(e) => setCardNO(e.target.value)}
                                    size="small"
                                />
                            </FormControl>
                        </Grid>
                        <Grid item xs={3}>
                            <FormControl variant="outlined" margin="dense" style={{marginTop: '0px'}}
                                         fullWidth>
                                <FormLabel id="rope_scaling-label">RoPE 插值方法</FormLabel>
                                <RadioGroup
                                    row
                                    value={rope_scaling}
                                    onChange={(e) => setRope_scaling(e.target.value)}
                                    aria-labelledby="rope_scaling-label"
                                    name="rope_scaling"
                                >
                                    <FormControlLabel value="none" control={<Radio/>} label="none"/>
                                    <FormControlLabel value="linear" control={<Radio/>} label="linear"/>
                                    <FormControlLabel value="dynamic" control={<Radio/>}
                                                      label="dynamic"/>
                                </RadioGroup>

                            </FormControl>
                        </Grid>
                        <Grid item xs={3}>
                            <FormControl variant="outlined" margin="dense" style={{marginTop: '0px'}}
                                         fullWidth>
                                <FormLabel id="booster-label">加速方式</FormLabel>
                                <RadioGroup
                                    row
                                    value={booster}
                                    onChange={(e) => setBooster(e.target.value)}
                                    aria-labelledby="booster-label"
                                    name="booster"
                                >
                                    <FormControlLabel value="none" control={<Radio/>} label="none"/>
                                    <FormControlLabel value="fa2" control={<Radio/>}
                                                      label="flashattn2"/>
                                    <FormControlLabel value="auto" control={<Radio/>}
                                                      label="unsloth"/>
                                </RadioGroup>
                            </FormControl>
                        </Grid>

                        <Grid item xs={4}>
                            <FormControl variant="outlined" margin="dense" fullWidth>
                                <div style={{
                                    display: 'flex',
                                    flexFlow: 'column',
                                    padding: '5px',
                                    border: '1px solid rgb(192, 192, 192)',
                                    borderRadius: '5px'
                                }}>
                                    <FormLabel id="cutoff_len-label">截断长度</FormLabel>
                                    <div style={{display: 'flex', flexFlow: 'row', paddingLeft: '10px'}}>
                                        <Slider sx={{flexGrow: 1}}
                                                value={typeof cutoff_len === 'number' ? cutoff_len : 0}
                                                onChange={(e, newValue) => {
                                                    setCutoff_len(newValue)
                                                }}
                                                step={1}
                                                min={4}
                                                max={65536}
                                                type='number'
                                                aria-labelledby="cutoff_len-slider"
                                        />
                                        <Input
                                            sx={{
                                                width: '80px',
                                                marginLeft: '15px',
                                                '& .MuiInputBase-input': {textAlign: 'center'}
                                            }}
                                            label="截断长度"
                                            value={cutoff_len}
                                            onChange={(e) => setCutoff_len(e.target.value)}
                                            size="small"
                                        />
                                    </div>
                                    <FormHelperText>输入序列分词后的最大长度</FormHelperText>
                                </div>
                            </FormControl>
                        </Grid>
                        <Grid item xs={4}>
                            <FormControl variant="outlined" margin="dense" fullWidth>
                                <div style={{
                                    display: 'flex',
                                    flexFlow: 'column',
                                    padding: '5px',
                                    border: '1px solid rgb(192, 192, 192)',
                                    borderRadius: '5px'
                                }}>
                                    <FormLabel id="batch_size-label">批处理大小</FormLabel>
                                    <div style={{display: 'flex', flexFlow: 'row', paddingLeft: '10px'}}>
                                        <Slider sx={{flexGrow: 1}}
                                                value={typeof batch_size === 'number' ? batch_size : 1}
                                                onChange={(e, newValue) => {
                                                    setBatch_size(newValue)
                                                }}
                                                step={1}
                                                min={1}
                                                max={1024}
                                                type='number'
                                                aria-labelledby="batch_size-slider"
                                        />
                                        <Input
                                            sx={{
                                                width: '80px',
                                                marginLeft: '15px',
                                                '& .MuiInputBase-input': {textAlign: 'center'}
                                            }}
                                            label="批处理大小"
                                            value={batch_size}
                                            onChange={(e) => setBatch_size(e.target.value)}
                                            size="small"
                                        />
                                    </div>
                                    <FormHelperText>每个GPU处理的样本数量</FormHelperText>
                                </div>
                            </FormControl>
                        </Grid>
                        <Grid item xs={4}>
                            <FormControl variant="outlined" margin="normal" fullWidth>
                                <TextField
                                    label="最大样本数"
                                    value={max_samples}
                                    helperText="每个数据集的最大样本数"
                                    onChange={(e) => setMax_samples(e.target.value)}
                                    size="small"
                                />
                            </FormControl>
                        </Grid>

                        <Grid item xs={4}>
                            <FormControl variant="outlined" margin="dense" fullWidth>
                                <div style={{
                                    display: 'flex',
                                    flexFlow: 'column',
                                    padding: '5px',
                                    border: '1px solid rgb(192, 192, 192)',
                                    borderRadius: '5px'
                                }}>
                                    <FormLabel id="cutoff_len-label">最大生成长度</FormLabel>
                                    <div style={{display: 'flex', flexFlow: 'row', paddingLeft: '10px'}}>
                                        <Slider sx={{flexGrow: 1}}
                                                value={typeof max_new_tokens === 'number' ? max_new_tokens : 8}
                                                onChange={(e, newValue) => {
                                                    setMax_new_tokens(newValue)
                                                }}
                                                step={1}
                                                min={8}
                                                max={4096}
                                                type='number'
                                                aria-labelledby="cutoff_len-slider"
                                        />
                                        <Input
                                            sx={{
                                                width: '80px',
                                                marginLeft: '15px',
                                                '& .MuiInputBase-input': {textAlign: 'center'}
                                            }}
                                            label="最大生成长度"
                                            value={max_new_tokens}
                                            onChange={(e) => setMax_new_tokens(e.target.value)}
                                            size="small"
                                        />
                                    </div>
                                    <FormHelperText>输入最大生成长度</FormHelperText>
                                </div>
                            </FormControl>
                        </Grid>
                        <Grid item xs={4}>
                            <FormControl variant="outlined" margin="dense" fullWidth>
                                <div style={{
                                    display: 'flex',
                                    flexFlow: 'column',
                                    padding: '5px',
                                    border: '1px solid rgb(192, 192, 192)',
                                    borderRadius: '5px'
                                }}>
                                    <FormLabel id="cutoff_len-label">Top-p 采样值</FormLabel>
                                    <div style={{display: 'flex', flexFlow: 'row', paddingLeft: '10px'}}>
                                        <Slider sx={{flexGrow: 1}}
                                                value={typeof top_p === 'number' ? top_p : 0.01}
                                                onChange={(e, newValue) => {
                                                    setTop_p(newValue)
                                                }}
                                                step={0.01}
                                                min={0.01}
                                                max={1}
                                                type='number'
                                                aria-labelledby="cutoff_len-slider"
                                        />
                                        <Input
                                            sx={{
                                                width: '80px',
                                                marginLeft: '15px',
                                                '& .MuiInputBase-input': {textAlign: 'center'}
                                            }}
                                            label="Top-p 采样值"
                                            value={top_p}
                                            onChange={(e) => setTop_p(e.target.value)}
                                            size="small"
                                        />
                                    </div>
                                    <FormHelperText>输入Top-p 采样值</FormHelperText>
                                </div>
                            </FormControl>
                        </Grid>
                        <Grid item xs={4}>
                            <FormControl variant="outlined" margin="dense" fullWidth>
                                <div style={{
                                    display: 'flex',
                                    flexFlow: 'column',
                                    padding: '5px',
                                    border: '1px solid rgb(192, 192, 192)',
                                    borderRadius: '5px'
                                }}>
                                    <FormLabel id="cutoff_len-label">温度系数</FormLabel>
                                    <div style={{display: 'flex', flexFlow: 'row', paddingLeft: '10px'}}>
                                        <Slider sx={{flexGrow: 1}}
                                                value={typeof temperature === 'number' ? temperature : 0.01}
                                                onChange={(e, newValue) => {
                                                    setTemperature(newValue)
                                                }}
                                                step={0.01}
                                                min={0.01}
                                                max={1.5}
                                                type='number'
                                                aria-labelledby="cutoff_len-slider"
                                        />
                                        <Input
                                            sx={{
                                                width: '80px',
                                                marginLeft: '15px',
                                                '& .MuiInputBase-input': {textAlign: 'center'}
                                            }}
                                            label="温度系数"
                                            value={temperature}
                                            onChange={(e) => setTemperature(e.target.value)}
                                            size="small"
                                        />
                                    </div>
                                    <FormHelperText>输入温度系数</FormHelperText>
                                </div>
                            </FormControl>
                        </Grid>
                        {/*<Grid item xs={4}>*/}
                        {/*    <FormControl variant="outlined" margin="normal" fullWidth>*/}
                        {/*        <TextField*/}
                        {/*            label="输出目录"*/}
                        {/*            value={output_dir}*/}
                        {/*            helperText="保存结果的路径"*/}
                        {/*            onChange={(e) => setOutput_dir(e.target.value)}*/}
                        {/*            size="small"*/}
                        {/*        />*/}
                        {/*    </FormControl>*/}
                        {/*</Grid>*/}
                        <Grid item xs={8}>
                            <FormControl variant="outlined" margin="dense" fullWidth>
                                <div style={{display: 'flex'}}>
                                    <InputLabel id="dataset-label">数据集</InputLabel>
                                    <Select
                                        labelId="dataset-label"
                                        style={{flexGrow: 1}}
                                        value={dataset}
                                        multiple
                                        onChange={(e) => {
                                            // const {target: { value },} = e;
                                            setDataset(e.target.value);
                                        }}
                                        input={<OutlinedInput label="数据集"/>}
                                        renderValue={(selected) => selected.join(', ')}
                                        MenuProps={MenuProps}
                                        label="数据集"
                                        size="small"
                                    >
                                        {datasetList.map((item) => {
                                            return (
                                                <MenuItem key={item.value} value={item.value}>
                                                    <Checkbox
                                                        checked={dataset.indexOf(item.value) > -1}/>
                                                    <ListItemText primary={item.value}/>
                                                    {item.name}
                                                </MenuItem>
                                            )
                                        })}
                                    </Select>
                                    {/*<Button*/}
                                    {/*    variant="contained"*/}
                                    {/*    size="small"*/}
                                    {/*    endIcon={<VisibilitySharpIcon/>}*/}
                                    {/*    className="addBtn"*/}
                                    {/*    onClick={handleViewDataset}*/}
                                    {/*>*/}
                                    {/*    预览数据集*/}
                                    {/*</Button>*/}
                                </div>
                            </FormControl>
                        </Grid>
                        <Grid item xs={4}>
                            <FormControl variant="outlined" margin="normal" fullWidth>
                                <div style={{display: 'flex'}}>
                                    {/*<TextField*/}
                                    {/*    label="输出目录"*/}
                                    {/*    value={output_dir}*/}
                                    {/*    style={{flexGrow: 1}}*/}
                                    {/*    helperText=""*/}
                                    {/*    onChange={(e) => setOutput_dir(e.target.value)}*/}
                                    {/*    size="small"*/}
                                    {/*/>*/}

                                    <FormControlLabel
                                        control={<Checkbox checked={predict} onChange={handleCheckBoxChange}/>}
                                        label="保存测试结果"/>
                                    <LoadingButton
                                                variant="contained"
                                                size="small"
                                                endIcon={<RocketLaunchIcon/>}
                                                className="addBtn"
                                                loading={loading}
                                                loadingPosition="end"
                                                onClick={()=>{
                                                 setConfirmType(1);
                                                 setIsShowConfirm(true);
                                                }}
                                            >
                                                开始测试
                                            </LoadingButton>

                                    <Button
                                        disabled={!isEnable}
                                        variant="contained"
                                        size="small"
                                        endIcon={<CancelIcon/>}
                                        className="addBtn"
                                        onClick={()=>{
                                             setConfirmType(2);
                                             setIsShowConfirm(true);
                                        }}
                                    >
                                        中止测试
                                    </Button>
                                </div>
                            </FormControl>
                        </Grid>
                    </Grid>
                     </Paper>
                    <Paper elevation={2} style={{padding: "20px", marginTop: "10px"}}>
                            <Grid container spacing={1}>
                                    <Grid item xs={12}>
                                        <Paper elevation={3} style={{padding: '18px'}}>
                                            <Typography sx={{mt: 4, mb: 2}} style={{marginTop: '0px'}} variant="h3"
                                                        component="div">结果明细</Typography>
                                            <List ref={listRef} dense={false}
                                                  style={{height: "320px", overflow: "auto"}}>
                                                {
                                                    returnContent.map((item) => {
                                                        return (
                                                            <ListItem>
                                                                <ListItemIcon>
                                                                    <FileDownloadDoneIcon/>
                                                                </ListItemIcon>
                                                                <ListItemText
                                                                    primary={item}
                                                                />
                                                            </ListItem>
                                                        )
                                                    })
                                                }
                                            </List>
                                        </Paper>
                                    </Grid>
                            </Grid>
                        </Paper>
                </Box>
            </Box>


             <Dialog open={isShowConfirm} onClose={handleClose} aria-labelledby="alert-dialog-title"
                    aria-describedby="alert-dialog-description">
                <DialogTitle id="alert-dialog-title">{"操作确认"}</DialogTitle>
                <DialogContent>
                    <DialogContentText id="alert-dialog-description">
                        确认要执行该操作？
                    </DialogContentText>
                </DialogContent>
                <DialogActions>
                    <Button onClick={handleClose}>取消</Button>
                    <Button onClick={handleConfirm} autoFocus>
                        确认
                    </Button>
                </DialogActions>
            </Dialog>
        </Box>
    )
}

export default TestDetail
