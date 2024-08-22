import {
    Box,
    Button,
    Drawer,
    FormControl,
    Grid,
    Select,
    InputLabel,
    MenuItem,
    TextField,
    OutlinedInput,
    ListItemText,
    Tab,
    Accordion,
    AccordionSummary,
    AccordionDetails,
    FormLabel,
    RadioGroup,
    FormControlLabel,
    Radio,
    ListItem,
    ListItemIcon,
    List,
    Slider,
    Input,
    FormHelperText,
    Dialog,
    DialogTitle,
    DialogContent, DialogContentText, DialogActions
} from '@mui/material'
import React, {useContext, useEffect, useRef, useState} from 'react'
import {useCookies} from 'react-cookie'
import {useNavigate, useParams} from 'react-router-dom'
//import VisibilitySharpIcon from '@mui/icons-material/VisibilitySharp';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import CancelIcon from '@mui/icons-material/Cancel';
import RocketLaunchIcon from '@mui/icons-material/RocketLaunch';
import {ApiContext} from '../../components/apiContext'
import ErrorMessageSnackBar from '../../components/errorMessageSnackBar'
import fetcher from '../../components/fetcher'
import Title from '../../components/Title'
import styles from "./styles/modelCardStyle";
import {RocketLaunchOutlined, UndoOutlined} from "@mui/icons-material";
import Checkbox from '@mui/material/Checkbox';
import {LoadingButton, TabContext, TabList, TabPanel} from "@mui/lab";
import Paper from "@mui/material/Paper";
import {LineChart} from '@mui/x-charts/LineChart';
import FileDownloadDoneIcon from '@mui/icons-material/FileDownloadDone';
import Typography from "@mui/material/Typography";
import SuccessMessageSnackBar from "../../components/successMessageSnackBar";

const TrainDetail = () => {
    const {id} = useParams();
    const name = id;
    const [value, setValue] = useState("0")
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
    const parentRef = useRef(null)
    const {isCallingApi, setIsCallingApi} = useContext(ApiContext)
    const {isUpdatingModel, setIsUpdatingModel} = useContext(ApiContext)
    const {setErrorMsg} = useContext(ApiContext)
    const [cookie] = useCookies(['token'])
    const navigate = useNavigate()
    const [loading, setLoading] = useState(false)
    //语言类型
    // const langOptions = [{name: "zh", value: "zh"}, {name: "en", value: "en"}, {name: "ru", value: "ru"}];
    //模型语言
    //const [modelLanguage, setModelLanguage] = useState('zh');
    //模型集合
    // const [modelList,setModelList]=useState([])
    //模型名称
    //const [modelName, setModelName] = useState(name);
    //模型路径
    const [model_name_or_path, setModel_name_or_path] = useState('models/'+name);
    //训练轮数
    //const [trainingRound, setTrainingRound] = useState(3);
    //数据集集合
    const [datasetList, setDatasetList] = useState([]);
    //数据集
    const [dataset, setDataset] = useState([]);

    //高级训练
    //语言
    //const [lang, setLang] = useState('')
    //模型名称
    //const [model_name, setModel_name] = useState('')
    //显卡序号
    const [cardNO, setCardNO] = useState('0')

    //模型路径
    const [model_path, setModel_path] = useState('models/'+name)
    //微调方法类型
    const finetuningTypeOptions = [{name: 'full', value: 'full'}, {name: 'freeze', value: 'freeze'}, {
        name: 'lora',
        value: 'lora'
    }]
    //微调方法
    const [finetuning_type, setFinetuning_type] = useState('lora')
    //适配器路径
    const [adapter_path, setAdapter_path] = useState('')
    //量化等级选项
    const quantizationBitOptions = [{name: "none", value: "none"}, {name: "8", value: "8"}, {name: "4", value: "4"}]
    //量化等级
    const [quantization_bit, setQuantization_bit] = useState('8')
    //提示模版选项
    //const templateOptions = [{name: 'phi', value: 'phi'}, {name: 'default', value: 'default'}]
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
    //ROPE插值方法选项
    // const ropeScalingOptions=[{name:'none',value:'none'},{name:'linear',value:'linear'},{name:'dynamic',value:'dynamic'}]
    //ROPE插值方法
    const [rope_scaling, setRope_scaling] = useState('linear')
    //加速方式选项
    //const boosterOptions=[{name:'none',value:'none'},{name:'flashattn2',value:'flashattn2'},{name:'unsloth',value:'unsloth'}]
    //加速方式
    const [booster, setBooster] = useState('none')
    //Train
    //训练阶段选项
    const trainingStageOptions = [{name: 'Supervised Fine-Tuning', value: 'sft'}, {
        name: 'Reward Modeling',
        value: 'rm'
    }, {name: 'PPO', value: 'ppo'}, {name: 'DPO', value: 'dpo'}, {name: 'ORPO', value: 'orpo'}, {
        name: 'Pre-Training',
        value: 'pt'
    }]
    //训练阶段
    const [training_stage, setTraining_stage] = useState('sft')

    //数据路径
    //const [dataset_dir, setDataset_dir] = useState('./xinference/factory/data/')
    const dataset_dir = './xinference/factory/data/'
    //学习率
    const [learning_rate, setLearning_rate] = useState('5e-5')
    //训练轮数
    const [num_train_epochs, setNum_train_epochs] = useState('3.0')
    //最大梯度范数
    const [max_grad_norm, setMax_grad_norm] = useState('1.0')
    //最大样本数
    const [max_samples, setMax_samples] = useState('100000')
    //计算类型选项
    const computeTypeOptions = [{name: 'fp16', value: 'fp16'}, {name: 'bf16', value: 'bf16'}, {
        name: 'fp32',
        value: 'fp32'
    }, {name: 'pure_bf16', value: 'pure_bf16'}]
    //计算类型
    const [compute_type, setCompute_type] = useState('fp16')
    //截断长度
    const [cutoff_len, setCutoff_len] = useState('1024')
    //批处理大小
    const [batch_size, setBatch_size] = useState('2')
    //梯度累积
    const [gradient_accumulation_steps, setGradient_accumulation_steps] = useState('8')
    //验证集比例
    const [val_size, setVal_size] = useState('0')
    //学习率调节器选项
    const lrSchedulerTypeOptions = [{name: 'linear', value: 'linear'}, {
        name: 'cosine',
        value: 'cosine'
    }, {name: 'cosine_with_restarts', value: 'cosine_with_restarts'}, {
        name: 'polynomial',
        value: 'polynomial'
    }, {name: 'constant', value: 'constant'}, {
        name: 'constant_with_warmup',
        value: 'constant_with_warmup'
    }, {name: 'inverse_sqrt', value: 'inverse_sqrt'}, {
        name: 'reduce_lr_on_plateau',
        value: 'reduce_lr_on_plateau'
    }, {name: 'cosine_with_min_lr', value: 'cosine_with_min_lr'}]
    //学习率调节器
    const [lr_scheduler_type, setLr_scheduler_type] = useState('cosine')
    //其它参数设置
    //日志间隔
    const [logging_steps, setLogging_steps] = useState('5')
    //保存间隔
    const [save_steps, setSave_steps] = useState('100')
    //预热步数
    const [warmup_steps, setWarmup_steps] = useState('0')
    //NEFTune噪声参数
    const [neftune_alpha, setNeftune_alpha] = useState('1')
    //优化器
    const [optim, setOptim] = useState('adamw_torch')
    //更改词表大小
    const [resize_vocab, setResize_vocab] = useState(false)
    //缩放归一化层
    const [upcast_layernorm, setUpcast_layernorm] = useState(false)
    //使用 S^2 Attention
    const [shift_attn, setShift_attn] = useState(false)
    //序列打包
    const [packing, setPacking] = useState(false)
    //使用 LLaMA Pro
    //const [use_llama_pro, setUse_llama_pro] = useState(false)
    //启用外部记录面板
    //const [report_to, setReport_to] = useState(false)
    //部分参数微调设置
    //可训练层数
    const [freeze_trainable_layers, setFreeze_trainable_layers] = useState('2')
    //可训练模块
    const [freeze_trainable_modules, setFreeze_trainable_modules] = useState('all')
    //额外模块（非必填
    const [freeze_extra_modules, setFreeze_extra_modules] = useState('')
    //LoRA参数设置
    //LoRA 秩
    const [lora_rank, setLora_rank] = useState('8')
    //LoRA 缩放系数
    const [lora_alpha, setLora_alpha] = useState('16')
    //LoRA 随机丢弃
    const [lora_dropout, setLora_dropout] = useState('0')
    //LoRA+ 学习率比例
    const [loraplus_lr_ratio, setLoraplus_lr_ratio] = useState('0')
    //新建适配器
    const [create_new_adapter, setCreate_new_adapter] = useState(false)
    //使用 rslora
    const [use_rslora, setUse_rslora] = useState('')
    //使用 DoRA
    const [use_dora, setUse_dora] = useState('')
    //LoRA 作用模块（非必填）
    const [lora_target, setLora_target] = useState('')
    //附加模块（非必填）
    const [additional_target, setAdditional_target] = useState('')
    //RLHF参数设置
    //DPO beta 参数
    const [dpo_beta, setDpo_beta] = useState('0.1')
    //DPO-ftx 权重
    const [dpo_ftx, setDpo_ftx] = useState('0')
    //ORPO beta 参数
    const [orpo_beta, setOrpo_beta] = useState('0.1')
    //奖励模型选项
    // const rewardModelOptions = []
    //奖励模型
    const [reward_model, setReward_model] = useState('')
    //GaLore 参数设置
    //使用 GaLore
    const [use_galore, setUse_galore] = useState(false)
    //GaLore 秩
    const [galore_rank, setGalore_rank] = useState('16')
    //更新间隔
    const [galore_update_interval, setGalore_update_interval] = useState('200')
    //GaLore 缩放系数
    const [galore_scale, setGalore_scale] = useState('0.25')
    //GaLore 作用模块
    const [galore_target, setGalore_target] = useState('all')
    //BAdam参数设置
    //使用 BAdam
    const [use_badam, setUse_badam] = useState('')
    //BAdam 模式选项
    const badamModeOptions = [{name: 'layer', value: 'layer'}, {name: 'ratio', value: 'ratio'}]
    //BAdam 模式
    const [badam_mode, setBadam_mode] = useState('layer')
    //切换策略选项
    const badamSwitchModeOptions = [{name: "ascending", value: "ascending"}, {
        name: "descending",
        value: "descending"
    }, {name: "random", value: "random"}, {name: "fixed", value: "fixed"}]
    //切换策略
    const [badam_switch_mode, setBadam_switch_mode] = useState('ascending')
    //切换频率
    const [badam_switch_interval, setBadam_switch_interval] = useState('50')
    //Block 更新比例
    const [badam_update_ratio, setBadam_update_ratio] = useState('0.05')
    //输出目录
    //const [output_dir, setOutput_dir] = useState('')
    //配置路径
    //const [config_path, setConfig_path] = useState('')

    //新增数据是否显示抽屉
    const [isShow, setIsShow] = useState(false)
    const [isEnable, setIsEnable] = useState(false);
    const [isHighEnable, setIsHighEnable] = useState(false);
    //训练输入结果
    // const [output, setOutput] = useState([])
    //是否显示训练图表
    const [isShowChart, setIsShowChart] = useState(true);
    const [isHighShowChart, setIsHighShowChart] = useState(true);

    //图表元数据
    const [graphs, setGraphs] = useState([])
    const [highGraphs, setHighGraphs] = useState([])
    //图表X轴数据
    const [xAxis, setXAxis] = useState([])
    const [xHighAxis, setXHighAxis] = useState([])
    //图标Y轴数据
    const [yAxis, setYAxis] = useState([])
    const [yHighAxis, setYHighAxis] = useState([])
    const [returnContent, setReturnContent] = useState([])
    const [returnHighContent, setReturnHighContent] = useState([])
    const listRef = useRef(null); // 创建一个ref来引用<ul>
    const listHighRef = useRef(null)
    //是否显示Confirm框
    const [isShowConfirm, setIsShowConfirm] = useState(false)
    //确认类型：1 开始训练 2 中止训练 3 开始高级训练 4 中止高级训练
    const [confirmType, setConfirmType] = useState(1)
    const {setSuccessMsg} = useContext(ApiContext)

    //关闭确认
    const handleClose = (e) => {
        e.stopPropagation()
        setIsShowConfirm(false)
    }
    const handleConfirm = (e) => {
        e.stopPropagation()
        setIsShowConfirm(false)
        if (confirmType == 1) {
            handleTrainModel()
        } else if (confirmType == 2) {
            handleStopTrain()
        } else if (confirmType == 3) {
            handleHighTrainModel()
        } else if (confirmType == 4) {
            handleHighStopTrain()
        }
    }
    //页签切换
    const handleTabChange = (event, newValue) => {
        setValue(newValue)
    }
    //预览数据集
    // const handleViewDataset = () => {
    //     setIsShow(true)
    // }
    //模型训练
    const handleTrainModel = () => {
        if (isCallingApi || isUpdatingModel)
            return
        setIsEnable(true);
        setIsShowChart(true)
        setXAxis([])
        setYAxis([])
        setLoading(true)
        try {
            setIsCallingApi(true)
            fetcher(`${endPoint}/v1/runner/training`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(
                    {
                        "model_name_or_path": model_name_or_path,
                        "template": template,
                        "dataset": dataset,
                        "num_train_epochs": num_train_epochs,
                        "CUDA_VISIBLE_DEVICES": cardNO//显卡序号,多张显卡用,分割拼接
                    })
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
                    console.log(response);
                    const reader = response.body.getReader();
                    const decoder = new TextDecoder();
                    let content = '';
                    console.log(content)
                    setReturnContent([])
                    const read = () => {
                        reader.read().then(({done, value}) => {
                            if (done) {
                                // 当读取完成时，设置数据并关闭读取器
                                //  setReturnContent(content);
                                return reader.releaseLock();
                            }

                            // 将读取到的 Uint8Array 转换为字符串
                            const lineText = decoder.decode(value, {stream: true});
                            const tempArr = lineText.split('<END>').filter(function (cur) {
                                return cur.length > 0;
                            });
                            tempArr.forEach(function (cur) {
                                if (cur.indexOf('GRAPH:') >= 0) {
                                    const graph = JSON.parse(cur.replace('GRAPH:', '').replace(/'/g, '"'));
                                    setGraphs(preItems => [...preItems, graph])
                                }
                            })
                            setReturnContent(preItems => [...preItems, ...tempArr])
                            read(); // 继续读取直到完成
                        });
                    };
                    read();
                    console.log(returnContent)
                }
            })
        } catch (error) {
            console.error('Error:', error)
        } finally {
            setIsCallingApi(false)
        }
    }
    //中止训练
    const handleStopTrain = () => {
        if (isCallingApi || isUpdatingModel)
            return
        setLoading(true)
        try {
            setIsCallingApi(true)
            fetcher(`${endPoint}/v1/runner/terminate`, {
                method: 'GET'
            }).then((response) => {
                console.log(response);
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
                    setSuccessMsg("中止成功")
                    console.log(response);
                }
            })
        } catch (error) {
            console.error('Error:', error)
        } finally {
            setIsCallingApi(false)
        }
    }

    //模型高级训练
    const handleHighTrainModel = () => {
        if (isCallingApi || isUpdatingModel)
            return
        setIsHighEnable(true);
        setIsHighShowChart(true)
        setXHighAxis([])
        setYHighAxis([])
        setLoading(true)
        try {
            setIsCallingApi(true)
            // setDataset_dir('./xinference/factory/data/')//固定值
            const postData = {};
            postData.do_train = 'True'
            postData.CUDA_VISIBLE_DEVICES = cardNO//显卡序号,多张显卡用,分割拼接
            postData.model_name_or_path = model_path//模型名称
            if (adapter_path)
                postData.adapter_name_or_path = adapter_path//适配器路径
            postData.finetuning_type = finetuning_type//微调方法
            postData.quantization_bit = quantization_bit//量化等级
            postData.template = template//提示模版
            if (rope_scaling != 'none')
                postData.rope_scaling = rope_scaling//RoPE 插值方法
            if (booster != 'none')
                postData.flash_attn = booster//加速方式
            else
                postData.flash_attn = 'auto'//加速方式
            if (booster == 'unsloth')
                postData.use_unsloth = 'True'//如果加速方式是unsloth
            postData.stage = training_stage//训练阶段
            postData.dataset_dir = dataset_dir//数据路径
            postData.dataset = dataset.join(',')//数据集
            postData.learning_rate = learning_rate//学习率
            postData.num_train_epochs = num_train_epochs//训练轮数
            postData.max_grad_norm = max_grad_norm//最大梯度范数
            postData.max_samples = max_samples//最大样本数
            if (compute_type == "fp16")//计算类型
                postData.fp16 = 'True'
            else if (compute_type == 'bf16')
                postData.bf16 = 'True'
            else if (compute_type == 'pure_bf16')
                postData.pure_bf16 = 'True'
            postData.cutoff_len = cutoff_len//截断长度
            postData.per_device_train_batch_size = batch_size//批处理大小
            postData.gradient_accumulation_steps = gradient_accumulation_steps//梯度累积
            if (val_size != 0)
                postData.val_size = val_size//验证集比例
            postData.lr_scheduler_type = lr_scheduler_type//学习率调节器
            postData.logging_steps = logging_steps//日志间隔
            postData.save_steps = save_steps//保存间隔
            postData.warmup_steps = warmup_steps//预热步数
            if (neftune_alpha != 0)
                postData.neftune_noise_alpha = neftune_alpha//NEFTune噪声参数
            postData.optim = optim//优化器默认值为adamw_torch,可以写使用的优化器：adamw_torch、adamw_8bit 或 adafactor
            if (resize_vocab)
                postData.resize_vocab = 'True'//更改词表大小
            if (upcast_layernorm)
                postData.upcast_layernorm = 'True'//缩放归一化层
            if (packing)
                postData.packing = 'True'//序列打包
            if (shift_attn)
                postData.shift_attn = 'True'//使用 S^2 Attention
            if (training_stage == 'freeze')//仅当state为freeze时，才有
            {
                postData.freeze_trainable_layers = freeze_trainable_layers//可训练层数
                postData.freeze_trainable_modules = freeze_trainable_modules//可训练模块
                postData.freeze_extra_modules = freeze_extra_modules//额外模块
            }
            if (finetuning_type == 'lora')//仅当finetuning_type参数选lora的时候才有
            {
                postData.lora_rank = lora_rank//LoRA 矩阵的秩大小
                postData.lora_alpha = lora_alpha//LoRA 缩放系数大小
                postData.lora_dropout = lora_dropout//LoRA 随机丢弃
                if (loraplus_lr_ratio != 0)
                    postData.loraplus_lr_ratio = loraplus_lr_ratio//LoRA+学习率倍数
                if (create_new_adapter)
                    postData.create_new_adapter = 'True'//新建适配器
                if (use_rslora)
                    postData.use_rslora = 'True'//使用 rslora
                if (use_dora)
                    postData.use_dora = 'True'//使用 DoRA
                if (lora_target)
                    postData.lora_target = lora_target//LoRA作用模块
                if (additional_target)
                    postData.additional_target = additional_target//附加模块
            }
            if (training_stage == 'dpo')//仅当训练阶段为dpo时才有
            {
                postData.dpo_beta = dpo_beta//DPO beta参数
                postData.dpo_ftx = dpo_ftx//DPO ftx权重
            }
            if (training_stage == 'orpo')//仅当训练阶段为orpo时才有
            {
                postData.orpo_beta = orpo_beta//DPO beta参数
            }
            if (training_stage == 'ppo')//仅当训练阶段为ppo时才有
            {
                postData.reward_model = reward_model//奖励模型
                if (finetuning_type == 'lora')
                    postData.reward_model_type = finetuning_type
                else//finetuning_type为full 或 freeze
                    postData.reward_model_type = 'full'
            }
            if (use_galore)//使用GaLore参数设置
            {
                postData.galore_rank = galore_rank//GaLore 梯度的秩大小
                postData.galore_update_interval = galore_update_interval//相邻两次投影更新的步数
                postData.galore_scale = galore_scale//GaLore 缩放系数大小
                postData.galore_target = galore_target//GaLore 作用模块
            }
            if (use_badam)//使用BAdam参数设置
            {
                postData.badam_mode = badam_mode//BAdam模式
                postData.badam_switch_mode = badam_switch_mode//切换策略
                postData.badam_switch_interval = badam_switch_interval//切换频率
                postData.badam_update_ratio = badam_update_ratio//Block更新比例
            }
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
                    setReturnHighContent([])
                    const read = () => {
                        reader.read().then(({done, value}) => {
                            if (done) {
                                // 当读取完成时，设置数据并关闭读取器
                                //  setReturnContent(content);
                                return reader.releaseLock();
                            }
                            // 将读取到的 Uint8Array 转换为字符串
                            const lineText = decoder.decode(value, {stream: true});
                            const tempArr = lineText.split('<END>').filter(function (cur) {
                                return cur.length > 0;
                            });
                            tempArr.forEach(function (cur) {
                                if (cur.indexOf('GRAPH:') >= 0) {
                                    const graph = JSON.parse(cur.replace('GRAPH:', '').replace(/'/g, '"'));
                                    setHighGraphs(preItems => [...preItems, graph])
                                }
                            })
                            setReturnHighContent(preItems => [...preItems, ...tempArr])
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
    //中止高级训练
    const handleHighStopTrain = () => {
        if (isCallingApi || isUpdatingModel)
            return
        setLoading(true)
        try {
            setIsCallingApi(true)
            fetcher(`${endPoint}/v1/runner/terminate`, {
                method: 'GET'
            }).then((response) => {
                console.log(response);
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
                    setSuccessMsg("中止成功")
                    console.log(response);
                }
            })
        } catch (error) {
            console.error('Error:', error)
        } finally {
            setIsCallingApi(false)
        }
    }

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
        navigate('/train_model/llm')
    }
    //监听解析训练结果实时图表显示
    useEffect(() => {
        const xAxisArr = graphs.map(item => item.epoch)
        setXAxis(xAxisArr)
        console.log(xAxis);
        const yAxisArr = graphs.map(item => item.loss)
        setYAxis(yAxisArr)
        console.log(yAxis);
    }, [graphs])
    useEffect(() => {
        const xAxisArr = highGraphs.map(item => item.epoch)
        setXHighAxis(xAxisArr)
        console.log(xAxis);
        const yAxisArr = highGraphs.map(item => item.loss)
        setYHighAxis(yAxisArr)
        console.log(yAxis);
    }, [highGraphs])
    // 使用useEffect来监听数据源的变化,将滚动条置于页面底部
    useEffect(() => {
        if (listRef.current) {
            listRef.current.scrollTop = listRef.current.scrollHeight;
        }
    }, [returnContent]); // 只有当items改变时才运行此effect
    // 使用useEffect来监听数据源的变化,将滚动条置于页面底部
    useEffect(() => {
        if (listHighRef.current) {
            listHighRef.current.scrollTop = listHighRef.current.scrollHeight;
        }
    }, [returnHighContent]); // 只有当items改变时才运行此effect

    return (
        <Box m="20px">
            <div style={{display: 'flex'}}>
                <div style={{cursor: 'pointer'}} onClick={goBack}><Title title={'模型训练 / '}/></div>
                <Title title={' ' + name} color="text.primary"/>
            </div>
            <ErrorMessageSnackBar/>
            <SuccessMessageSnackBar/>
            <TabContext value={value}>
                <Box sx={{borderBottom: 1, borderColor: 'divider'}}>
                    <TabList value={value} onChange={handleTabChange} aria-label="tabs">
                        <Tab label="简单训练" value="0"/>
                        <Tab label="高级训练" value="1"/>
                    </TabList>
                </Box>
                <TabPanel value="0" sx={{padding: 0}}>
                    <Box
                        sx={{
                            height: '100%',
                            width: '100%',
                            paddingLeft: '100px',
                            paddingRight: '100px',
                            paddingTop: '20px',
                        }}
                    >
                        {/*<Box sx={{height: '100%', width: '100%', flexGrow: 1}}>*/}
                        <Paper elevation={2} style={{padding: "20px"}}>
                            <Grid container spacing={1}>
                                <Grid item xs={2}>
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
                                <Grid item xs={2}>
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

                                <Grid item xs={6}>
                                    <FormControl variant="outlined" margin="dense" fullWidth>
                                        <TextField
                                            label="模型路径"
                                            value={model_name_or_path}
                                            helperText="本地模型的文件路径"
                                            onChange={(e) => setModel_name_or_path(e.target.value)}
                                            size="small"
                                        />
                                    </FormControl>
                                </Grid>
                                <Grid item xs={2}>
                                    <FormControl variant="outlined" margin="dense" fullWidth>
                                        <TextField
                                            label="训练轮数"
                                            value={num_train_epochs}
                                            helperText="需要执行的训练轮数"
                                            onChange={(e) => setNum_train_epochs(e.target.value)}
                                            size="small"
                                        />
                                    </FormControl>
                                </Grid>
                                <Grid item xs={12}>
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
                                                            <Checkbox checked={dataset.indexOf(item.value) > -1}/>
                                                            <ListItemText primary={item.value}/>
                                                            {item.name}
                                                        </MenuItem>
                                                    )
                                                })}
                                            </Select>

                                            {/*<Button*/}
                                            {/*    variant="contained"*/}
                                            {/*    sx={{display: 'none'}}*/}
                                            {/*    size="small"*/}
                                            {/*    endIcon={<VisibilitySharpIcon/>}*/}
                                            {/*    className="addBtn"*/}
                                            {/*    onClick={handleViewDataset}*/}
                                            {/*>*/}
                                            {/*    预览数据集*/}
                                            {/*</Button>*/}
                                            <LoadingButton
                                                variant="contained"
                                                size="small"
                                                endIcon={<RocketLaunchIcon/>}
                                                className="addBtn"
                                                loading={loading}
                                                loadingPosition="end"
                                                onClick={() => {
                                                    setConfirmType(1);
                                                    setIsShowConfirm(true);
                                                }}
                                            >
                                                模型训练
                                            </LoadingButton>
                                            <Button
                                                disabled={!isEnable}
                                                variant="contained"
                                                size="small"
                                                endIcon={<CancelIcon/>}
                                                className="addBtn"
                                                onClick={() => {
                                                    setConfirmType(2);
                                                    setIsShowConfirm(true);
                                                }}
                                            >
                                                中止训练
                                            </Button>
                                        </div>
                                    </FormControl>
                                </Grid>
                            </Grid>
                        </Paper>
                        <Paper elevation={2} style={{padding: "20px", marginTop: "10px"}}>
                            <Grid container spacing={1}>
                                {isShowChart && (
                                    <Grid item xs={6}>
                                        <Paper elevation={3} style={{padding: '18px'}}>
                                            <Typography sx={{mt: 4, mb: 2}} style={{marginTop: '0px'}} variant="h3"
                                                        component="div">训练结果</Typography>
                                            <LineChart
                                                xAxis={[{data: xAxis}]}
                                                series={[
                                                    {
                                                        data: yAxis,
                                                    },
                                                ]}
                                                width={undefined}
                                                height={320}
                                            />
                                        </Paper>
                                    </Grid>)}
                                {isShowChart && (
                                    <Grid item xs={6}>
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
                                )}
                            </Grid>
                        </Paper>
                        {/*</Box>*/}
                    </Box>
                </TabPanel>
                <TabPanel value="1" sx={{padding: 0}}>
                    <Box
                        sx={{
                            height: '100%',
                            width: '100%',
                            paddingLeft: '100px',
                            paddingRight: '100px',
                            paddingTop: '20px',
                        }}
                    >
                        <Paper elevation={2} style={{padding: "20px"}}>
                            <Grid container spacing={1}>
                                {/*<Grid item xs={6}>*/}
                                {/*    <FormControl variant="outlined" margin="dense" fullWidth>*/}
                                {/*        <TextField*/}
                                {/*            label="模型名称"*/}
                                {/*            value={model_name}*/}
                                {/*            onChange={(e) => setModel_name(e.target.value)}*/}
                                {/*            size="small"*/}
                                {/*        />*/}
                                {/*    </FormControl>*/}
                                {/*</Grid>*/}
                                <Grid item xs={2}>
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
                                <Grid item xs={2}>
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
                                <Grid item xs={4}>
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
                                <Grid item xs={4}>
                                    <FormControl variant="outlined" margin="dense" fullWidth>
                                        <div style={{display: 'flex'}}>
                                            <TextField
                                                label="适配器路径"
                                                value={adapter_path}
                                                style={{flexGrow: 1}}
                                                helperText=""
                                                onChange={(e) => setAdapter_path(e.target.value)}
                                                size="small"
                                            />
                                            {/*<Button*/}
                                            {/*    variant="contained"*/}
                                            {/*    size="small"*/}
                                            {/*    endIcon={<VisibilitySharpIcon/>}*/}
                                            {/*    className="addBtn"*/}
                                            {/*    onClick={handleViewDataset}*/}
                                            {/*>*/}
                                            {/*    刷新适配器*/}
                                            {/*</Button>*/}
                                        </div>
                                    </FormControl>
                                </Grid>

                            </Grid>
                        </Paper>
                        <Paper elevation={2} style={{padding: "20px", marginTop: "10px"}}>
                            <Accordion>
                                <AccordionSummary
                                    expandIcon={<ExpandMoreIcon/>}
                                    aria-controls="panel1-content"
                                    id="panel1-header"
                                >
                                    高级设置
                                </AccordionSummary>
                                <AccordionDetails>
                                    <Grid container spacing={1}>
                                        <Grid item xs={3}>
                                            <FormControl variant="outlined" margin="dense" fullWidth>
                                                <InputLabel id="quantization_bit-label">量化等级</InputLabel>
                                                <Select
                                                    labelId="quantization_bit-label"
                                                    value={quantization_bit}
                                                    onChange={(e) => setQuantization_bit(e.target.value)}
                                                    label="量化等级"
                                                    size="small"
                                                >
                                                    {quantizationBitOptions.map((item) => {
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
                                    </Grid>
                                </AccordionDetails>
                            </Accordion>
                            <Accordion>
                                <AccordionSummary
                                    expandIcon={<ExpandMoreIcon/>}
                                    aria-controls="panel1-content"
                                    id="panel1-header"
                                >
                                    训练
                                </AccordionSummary>
                                <AccordionDetails>
                                    <Grid container spacing={1}>
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
                                        {/*<Grid item xs={3}>*/}
                                        {/*    <FormControl variant="outlined" margin="dense" fullWidth>*/}
                                        {/*        <TextField*/}
                                        {/*            label="数据路径"*/}
                                        {/*            value={dataset_dir}*/}
                                        {/*            helperText="数据文件夹的路径"*/}
                                        {/*            onChange={(e) => setDataset_dir(e.target.value)}*/}
                                        {/*            size="small"*/}
                                        {/*        />*/}
                                        {/*    </FormControl>*/}
                                        {/*</Grid>*/}
                                        <Grid item xs={9}>
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


                                        <Grid item xs={3}>
                                            <FormControl variant="outlined" margin="dense" fullWidth>
                                                <TextField
                                                    label="学习率"
                                                    value={learning_rate}
                                                    helperText="AdamW 优化器的初始学习率"
                                                    onChange={(e) => setLearning_rate(e.target.value)}
                                                    size="small"
                                                />
                                            </FormControl>
                                        </Grid>
                                        <Grid item xs={3}>
                                            <FormControl variant="outlined" margin="dense" fullWidth>
                                                <TextField
                                                    label="训练轮数"
                                                    value={num_train_epochs}
                                                    helperText="需要执行的训练总轮数"
                                                    onChange={(e) => setNum_train_epochs(e.target.value)}
                                                    size="small"
                                                />
                                            </FormControl>
                                        </Grid>
                                        <Grid item xs={3}>
                                            <FormControl variant="outlined" margin="dense" fullWidth>
                                                <TextField
                                                    label="最大梯度范数"
                                                    value={max_grad_norm}
                                                    helperText="用于梯度裁剪的范数"
                                                    onChange={(e) => setMax_grad_norm(e.target.value)}
                                                    size="small"
                                                />
                                            </FormControl>
                                        </Grid>
                                        <Grid item xs={3}>
                                            <FormControl variant="outlined" margin="dense" fullWidth>
                                                <TextField
                                                    label="最大样本数"
                                                    value={max_samples}
                                                    helperText="每个数据集的最大样本数"
                                                    onChange={(e) => setMax_samples(e.target.value)}
                                                    size="small"
                                                />
                                            </FormControl>
                                        </Grid>


                                        <Grid item xs={3}>
                                            <FormControl variant="outlined" margin="dense" fullWidth>
                                                <div style={{
                                                    display: 'flex',
                                                    flexFlow: 'column',
                                                    padding: '5px',
                                                    border: '1px solid rgb(192, 192, 192)',
                                                    borderRadius: '5px'
                                                }}>
                                                    <FormLabel id="cutoff_len-label">截断长度</FormLabel>
                                                    <div
                                                        style={{display: 'flex', flexFlow: 'row', paddingLeft: '10px'}}>
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
                                        <Grid item xs={3}>
                                            <FormControl variant="outlined" margin="dense" fullWidth>
                                                <div style={{
                                                    display: 'flex',
                                                    flexFlow: 'column',
                                                    padding: '5px',
                                                    border: '1px solid rgb(192, 192, 192)',
                                                    borderRadius: '5px'
                                                }}>
                                                    <FormLabel id="batch_size-label">批处理大小</FormLabel>
                                                    <div
                                                        style={{display: 'flex', flexFlow: 'row', paddingLeft: '10px'}}>
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
                                        <Grid item xs={3}>
                                            <FormControl variant="outlined" margin="dense" fullWidth>
                                                <div style={{
                                                    display: 'flex',
                                                    flexFlow: 'column',
                                                    padding: '5px',
                                                    border: '1px solid rgb(192, 192, 192)',
                                                    borderRadius: '5px'
                                                }}>
                                                    <FormLabel
                                                        id="gradient_accumulation_steps-label">梯度累积</FormLabel>
                                                    <div
                                                        style={{display: 'flex', flexFlow: 'row', paddingLeft: '10px'}}>
                                                        <Slider sx={{flexGrow: 1}}
                                                                value={typeof gradient_accumulation_steps === 'number' ? gradient_accumulation_steps : 1}
                                                                onChange={(e, newValue) => {
                                                                    setGradient_accumulation_steps(newValue)
                                                                }}
                                                                step={1}
                                                                min={1}
                                                                max={1024}
                                                                type='number'
                                                                aria-labelledby="gradient_accumulation_steps-slider"
                                                        />
                                                        <Input
                                                            sx={{
                                                                width: '80px',
                                                                marginLeft: '15px',
                                                                '& .MuiInputBase-input': {textAlign: 'center'}
                                                            }}
                                                            value={gradient_accumulation_steps}
                                                            onChange={(e) => setGradient_accumulation_steps(e.target.value)}
                                                            size="small"
                                                        />
                                                    </div>
                                                    <FormHelperText>梯度累积的步数</FormHelperText>
                                                </div>
                                            </FormControl>
                                        </Grid>

                                        <Grid item xs={3}>
                                            <FormControl variant="outlined" margin="dense" fullWidth>
                                                <div style={{
                                                    display: 'flex',
                                                    flexFlow: 'column',
                                                    padding: '5px',
                                                    border: '1px solid rgb(192, 192, 192)',
                                                    borderRadius: '5px'
                                                }}>
                                                    <FormLabel id="val_size-label">验证集比例</FormLabel>
                                                    <div
                                                        style={{display: 'flex', flexFlow: 'row', paddingLeft: '10px'}}>
                                                        <Slider sx={{flexGrow: 1}}
                                                                value={typeof val_size === 'number' ? val_size : 0}
                                                                onChange={(e, newValue) => {
                                                                    setVal_size(newValue)
                                                                }}
                                                                step={0.001}
                                                                min={0}
                                                                max={1}
                                                                type='number'
                                                                aria-labelledby="val_size-slider"
                                                        />
                                                        <Input
                                                            sx={{
                                                                width: '80px',
                                                                marginLeft: '15px',
                                                                '& .MuiInputBase-input': {textAlign: 'center'}
                                                            }}
                                                            value={val_size}
                                                            onChange={(e) => setVal_size(e.target.value)}
                                                            size="small"
                                                        />
                                                    </div>
                                                    <FormHelperText>验证集占全部样本的百分比</FormHelperText>
                                                </div>
                                            </FormControl>
                                        </Grid>
                                        <Grid item xs={3}>
                                            <FormControl variant="outlined" margin="dense" fullWidth>
                                                <InputLabel id="compute_type-label">计算类型</InputLabel>
                                                <Select
                                                    labelId="compute_type-label"
                                                    value={compute_type}
                                                    onChange={(e) => setCompute_type(e.target.value)}
                                                    label="计算类型"
                                                    helperText="是否使用混合精度训练"
                                                    size="small"
                                                >
                                                    {computeTypeOptions.map((item) => {
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
                                                <InputLabel id="lr_scheduler_type-label">学习率调节器</InputLabel>
                                                <Select
                                                    labelId="lr_scheduler_type-label"
                                                    value={lr_scheduler_type}
                                                    onChange={(e) => setLr_scheduler_type(e.target.value)}
                                                    label="学习率调节器"
                                                    helperText="学习率调度器的名称"
                                                    size="small"
                                                >
                                                    {lrSchedulerTypeOptions.map((item) => {
                                                        return (
                                                            <MenuItem key={item.value} value={item.value}>
                                                                {item.name}
                                                            </MenuItem>
                                                        )
                                                    })}
                                                </Select>
                                            </FormControl>
                                        </Grid>
                                    </Grid>
                                </AccordionDetails>
                            </Accordion>
                            <Accordion>
                                <AccordionSummary
                                    expandIcon={<ExpandMoreIcon/>}
                                    aria-controls="panel1-content"
                                    id="panel1-header"
                                >
                                    其它参数设置
                                </AccordionSummary>
                                <AccordionDetails>
                                    <Grid container spacing={1}>
                                        <Grid item xs={3}>
                                            <FormControl variant="outlined" margin="dense" fullWidth>
                                                {/*<TextField*/}
                                                {/*    label="日志间隔"*/}
                                                {/*    value={logging_steps}*/}
                                                {/*    helperText="每两次日志输出间的更新步数"*/}
                                                {/*    onChange={(e) => setLogging_steps(e.target.value)}*/}
                                                {/*    size="small"*/}
                                                {/*/>*/}
                                                <div style={{
                                                    display: 'flex',
                                                    flexFlow: 'column',
                                                    padding: '5px',
                                                    border: '1px solid rgb(192, 192, 192)',
                                                    borderRadius: '5px'
                                                }}>
                                                    <FormLabel id="logging_steps-label">日志间隔</FormLabel>
                                                    <div
                                                        style={{display: 'flex', flexFlow: 'row', paddingLeft: '10px'}}>
                                                        <Slider sx={{flexGrow: 1}}
                                                                value={typeof logging_steps === 'number' ? logging_steps : 1}
                                                                onChange={(e, newValue) => {
                                                                    setLogging_steps(newValue)
                                                                }}
                                                                step={1}
                                                                min={1}
                                                                max={996}
                                                                type='number'
                                                                aria-labelledby="logging_steps-slider"
                                                        />
                                                        <Input
                                                            sx={{
                                                                width: '80px',
                                                                marginLeft: '15px',
                                                                '& .MuiInputBase-input': {textAlign: 'center'}
                                                            }}
                                                            value={logging_steps}
                                                            onChange={(e) => setLogging_steps(e.target.value)}
                                                            size="small"
                                                        />
                                                    </div>
                                                    <FormHelperText>每两次日志输出间的更新步数</FormHelperText>
                                                </div>
                                            </FormControl>
                                        </Grid>
                                        <Grid item xs={3}>
                                            <FormControl variant="outlined" margin="dense" fullWidth>
                                                {/*<TextField*/}
                                                {/*    label="保存间隔"*/}
                                                {/*    value={save_steps}*/}
                                                {/*    helperText="每两次断点保存间的更新步数"*/}
                                                {/*    onChange={(e) => setSave_steps(e.target.value)}*/}
                                                {/*    size="small"*/}
                                                {/*/>*/}
                                                <div style={{
                                                    display: 'flex',
                                                    flexFlow: 'column',
                                                    padding: '5px',
                                                    border: '1px solid rgb(192, 192, 192)',
                                                    borderRadius: '5px'
                                                }}>
                                                    <FormLabel id="save_steps-label">保存间隔</FormLabel>
                                                    <div
                                                        style={{display: 'flex', flexFlow: 'row', paddingLeft: '10px'}}>
                                                        <Slider sx={{flexGrow: 1}}
                                                                value={typeof save_steps === 'number' ? save_steps : 10}
                                                                onChange={(e, newValue) => {
                                                                    setSave_steps(newValue)
                                                                }}
                                                                step={10}
                                                                min={10}
                                                                max={5000}
                                                                type='number'
                                                                aria-labelledby="save_steps-slider"
                                                        />
                                                        <Input
                                                            sx={{
                                                                width: '80px',
                                                                marginLeft: '15px',
                                                                '& .MuiInputBase-input': {textAlign: 'center'}
                                                            }}
                                                            value={save_steps}
                                                            onChange={(e) => setSave_steps(e.target.value)}
                                                            size="small"
                                                        />
                                                    </div>
                                                    <FormHelperText>每两次断点保存间的更新步数</FormHelperText>
                                                </div>
                                            </FormControl>
                                        </Grid>
                                        <Grid item xs={3}>
                                            <FormControl variant="outlined" margin="dense" fullWidth>
                                                {/*<TextField*/}
                                                {/*    label="预热步数"*/}
                                                {/*    value={warmup_steps}*/}
                                                {/*    helperText="学习率预热采用的步数"*/}
                                                {/*    onChange={(e) => setWarmup_steps(e.target.value)}*/}
                                                {/*    size="small"*/}
                                                {/*/>*/}
                                                <div style={{
                                                    display: 'flex',
                                                    flexFlow: 'column',
                                                    padding: '5px',
                                                    border: '1px solid rgb(192, 192, 192)',
                                                    borderRadius: '5px'
                                                }}>
                                                    <FormLabel id="warmup_steps-label">预热步数</FormLabel>
                                                    <div
                                                        style={{display: 'flex', flexFlow: 'row', paddingLeft: '10px'}}>
                                                        <Slider sx={{flexGrow: 1}}
                                                                value={typeof warmup_steps === 'number' ? warmup_steps : 0}
                                                                onChange={(e, newValue) => {
                                                                    setWarmup_steps(newValue)
                                                                }}
                                                                step={1}
                                                                min={0}
                                                                max={5000}
                                                                type='number'
                                                                aria-labelledby="warmup_steps-slider"
                                                        />
                                                        <Input
                                                            sx={{
                                                                width: '80px',
                                                                marginLeft: '15px',
                                                                '& .MuiInputBase-input': {textAlign: 'center'}
                                                            }}
                                                            value={warmup_steps}
                                                            onChange={(e) => setWarmup_steps(e.target.value)}
                                                            size="small"
                                                        />
                                                    </div>
                                                    <FormHelperText>学习率预热采用的步数</FormHelperText>
                                                </div>
                                            </FormControl>
                                        </Grid>
                                        <Grid item xs={3}>
                                            <FormControl variant="outlined" margin="dense" fullWidth>
                                                {/*<TextField*/}
                                                {/*    label="NEFTune 噪声参数"*/}
                                                {/*    value={neftune_alpha}*/}
                                                {/*    helperText="嵌入向量所添加的噪声大小"*/}
                                                {/*    onChange={(e) => setNeftune_alpha(e.target.value)}*/}
                                                {/*    size="small"*/}
                                                {/*/>*/}
                                                <div style={{
                                                    display: 'flex',
                                                    flexFlow: 'column',
                                                    padding: '5px',
                                                    border: '1px solid rgb(192, 192, 192)',
                                                    borderRadius: '5px'
                                                }}>
                                                    <FormLabel id="neftune_alpha-label">NEFTune 噪声参数</FormLabel>
                                                    <div
                                                        style={{display: 'flex', flexFlow: 'row', paddingLeft: '10px'}}>
                                                        <Slider sx={{flexGrow: 1}}
                                                                value={typeof neftune_alpha === 'number' ? neftune_alpha : 0}
                                                                onChange={(e, newValue) => {
                                                                    setNeftune_alpha(newValue)
                                                                }}
                                                                step={0.1}
                                                                min={0}
                                                                max={10}
                                                                type='number'
                                                                aria-labelledby="neftune_alpha-slider"
                                                        />
                                                        <Input
                                                            sx={{
                                                                width: '80px',
                                                                marginLeft: '15px',
                                                                '& .MuiInputBase-input': {textAlign: 'center'}
                                                            }}
                                                            value={neftune_alpha}
                                                            onChange={(e) => setNeftune_alpha(e.target.value)}
                                                            size="small"
                                                        />
                                                    </div>
                                                    <FormHelperText>嵌入向量所添加的噪声大小</FormHelperText>
                                                </div>
                                            </FormControl>
                                        </Grid>

                                        <Grid item xs={3}>
                                            <FormControl variant="outlined" margin="dense" fullWidth>
                                                <FormControlLabel control={<Checkbox checked={resize_vocab}
                                                                                     onChange={(e) => setResize_vocab(e.target.checked)}/>}
                                                                  label="更改词表大小"/>
                                            </FormControl>
                                        </Grid>
                                        <Grid item xs={3}>
                                            <FormControl variant="outlined" margin="dense" fullWidth>
                                                <FormControlLabel control={<Checkbox checked={packing}
                                                                                     onChange={(e) => setPacking(e.target.checked)}/>}
                                                                  label="序列打包"/>
                                            </FormControl>
                                        </Grid>
                                        <Grid item xs={3}>
                                            <FormControl variant="outlined" margin="dense" fullWidth>
                                                <FormControlLabel control={<Checkbox checked={upcast_layernorm}
                                                                                     onChange={(e) => setUpcast_layernorm(e.target.checked)}/>}
                                                                  label="缩放归一化层"/>
                                            </FormControl>
                                        </Grid>
                                        {/*<Grid item xs={3}>*/}
                                        {/*    <FormControl variant="outlined" margin="dense" fullWidth>*/}
                                        {/*        <FormControlLabel control={<Checkbox checked={use_llama_pro}*/}
                                        {/*                                             onChange={(e) => setUse_llama_pro(e.target.checked)}/>}*/}
                                        {/*                          label="使用 LLaMA Pro"/>*/}
                                        {/*    </FormControl>*/}
                                        {/*</Grid>*/}

                                        <Grid item xs={3}>
                                            <FormControl variant="outlined" margin="dense" fullWidth>
                                                <FormControlLabel control={<Checkbox checked={shift_attn}
                                                                                     onChange={(e) => setShift_attn(e.target.checked)}/>}
                                                                  label="使用 S^2 Attention"/>
                                            </FormControl>
                                        </Grid>
                                        {/*<Grid item xs={3}>*/}
                                        {/*    <FormControl variant="outlined" margin="dense" fullWidth>*/}
                                        {/*        <FormControlLabel control={<Checkbox checked={report_to}*/}
                                        {/*                                             onChange={(e) => setReport_to(e.target.checked)}/>}*/}
                                        {/*                          label="启用外部记录面板"/>*/}
                                        {/*    </FormControl>*/}
                                        {/*</Grid>*/}
                                        <Grid item xs={3}>
                                            <FormControl variant="outlined" margin="dense" fullWidth>
                                                <TextField
                                                    label="优化器"
                                                    value={optim}
                                                    helperText="使用的优化器：adamw_torch、adamw_8bit 或 adafactor"
                                                    onChange={(e) => setOptim(e.target.value)}
                                                    size="small"
                                                />
                                            </FormControl>
                                        </Grid>
                                    </Grid>
                                </AccordionDetails>
                            </Accordion>

                            {finetuning_type == 'freeze' && <Accordion>
                                <AccordionSummary
                                    expandIcon={<ExpandMoreIcon/>}
                                    aria-controls="panel1-content"
                                    id="panel1-header"
                                >
                                    部分参数微调设置
                                </AccordionSummary>
                                <AccordionDetails>
                                    <Grid container spacing={1}>
                                        <Grid item xs={4}>
                                            <FormControl variant="outlined" margin="dense" fullWidth>
                                                {/*<TextField*/}
                                                {/*    label="可训练层数"*/}
                                                {/*    value={freeze_trainable_layers}*/}
                                                {/*    helperText="最末尾（+）/最前端（-）可训练隐藏层的数量"*/}
                                                {/*    onChange={(e) => setFreeze_trainable_layers(e.target.value)}*/}
                                                {/*    size="small"*/}
                                                {/*/>*/}
                                                <div style={{
                                                    display: 'flex',
                                                    flexFlow: 'column',
                                                    padding: '5px',
                                                    border: '1px solid rgb(192, 192, 192)',
                                                    borderRadius: '5px'
                                                }}>
                                                    <FormLabel id="freeze_trainable_layers-label">可训练层数</FormLabel>
                                                    <div
                                                        style={{display: 'flex', flexFlow: 'row', paddingLeft: '10px'}}>
                                                        <Slider sx={{flexGrow: 1}}
                                                                value={typeof freeze_trainable_layers === 'number' ? freeze_trainable_layers : 0}
                                                                onChange={(e, newValue) => {
                                                                    setFreeze_trainable_layers(newValue)
                                                                }}
                                                                step={1}
                                                                min={-128}
                                                                max={128}
                                                                type='number'
                                                                aria-labelledby="freeze_trainable_layers-slider"
                                                        />
                                                        <Input
                                                            sx={{
                                                                width: '80px',
                                                                marginLeft: '15px',
                                                                '& .MuiInputBase-input': {textAlign: 'center'}
                                                            }}
                                                            value={freeze_trainable_layers}
                                                            onChange={(e) => setFreeze_trainable_layers(e.target.value)}
                                                            size="small"
                                                        />
                                                    </div>
                                                    <FormHelperText>最末尾（+）/最前端（-）可训练隐藏层的数量</FormHelperText>
                                                </div>
                                            </FormControl>
                                        </Grid>
                                        <Grid item xs={4}>
                                            <FormControl variant="outlined" margin="dense" fullWidth>
                                                <TextField
                                                    label="可训练模块"
                                                    value={freeze_trainable_modules}
                                                    helperText="可训练模块的名称。使用英文逗号分隔多个名称"
                                                    onChange={(e) => setFreeze_trainable_modules(e.target.value)}
                                                    size="small"
                                                />
                                            </FormControl>
                                        </Grid>
                                        <Grid item xs={4}>
                                            <FormControl variant="outlined" margin="dense" fullWidth>
                                                <TextField
                                                    label="额外模块（非必填）"
                                                    value={freeze_extra_modules}
                                                    helperText="除隐藏层以外的可训练模块名称。使用英文逗号分隔多个名称"
                                                    onChange={(e) => setFreeze_extra_modules(e.target.value)}
                                                    size="small"
                                                />
                                            </FormControl>
                                        </Grid>
                                    </Grid>
                                </AccordionDetails>
                            </Accordion>}
                            {finetuning_type == 'lora' && <Accordion>
                                <AccordionSummary
                                    expandIcon={<ExpandMoreIcon/>}
                                    aria-controls="panel1-content"
                                    id="panel1-header"
                                >
                                    LoRA参数设置
                                </AccordionSummary>
                                <AccordionDetails>
                                    <Grid container spacing={1}>
                                        <Grid item xs={3}>
                                            <FormControl variant="outlined" margin="dense" fullWidth>
                                                {/*<TextField*/}
                                                {/*    label="LoRA 秩"*/}
                                                {/*    value={lora_rank}*/}
                                                {/*    helperText="LoRA 矩阵的秩大小"*/}
                                                {/*    onChange={(e) => setLora_rank(e.target.value)}*/}
                                                {/*    size="small"*/}
                                                {/*/>*/}
                                                <div style={{
                                                    display: 'flex',
                                                    flexFlow: 'column',
                                                    padding: '5px',
                                                    border: '1px solid rgb(192, 192, 192)',
                                                    borderRadius: '5px'
                                                }}>
                                                    <FormLabel id="lora_rank-label">LoRA 秩</FormLabel>
                                                    <div
                                                        style={{display: 'flex', flexFlow: 'row', paddingLeft: '10px'}}>
                                                        <Slider sx={{flexGrow: 1}}
                                                                value={typeof lora_rank === 'number' ? lora_rank : 1}
                                                                onChange={(e, newValue) => {
                                                                    setLora_rank(newValue)
                                                                }}
                                                                step={1}
                                                                min={1}
                                                                max={1024}
                                                                type='number'
                                                                aria-labelledby="lora_rank-slider"
                                                        />
                                                        <Input
                                                            sx={{
                                                                width: '80px',
                                                                marginLeft: '15px',
                                                                '& .MuiInputBase-input': {textAlign: 'center'}
                                                            }}
                                                            value={lora_rank}
                                                            onChange={(e) => setLora_rank(e.target.value)}
                                                            size="small"
                                                        />
                                                    </div>
                                                    <FormHelperText>LoRA 矩阵的秩大小</FormHelperText>
                                                </div>
                                            </FormControl>
                                        </Grid>
                                        <Grid item xs={3}>
                                            <FormControl variant="outlined" margin="dense" fullWidth>
                                                {/*<TextField*/}
                                                {/*    label="LoRA 缩放系数"*/}
                                                {/*    value={lora_alpha}*/}
                                                {/*    helperText="LoRA 缩放系数大小"*/}
                                                {/*    onChange={(e) => setLora_alpha(e.target.value)}*/}
                                                {/*    size="small"*/}
                                                {/*/>*/}
                                                <div style={{
                                                    display: 'flex',
                                                    flexFlow: 'column',
                                                    padding: '5px',
                                                    border: '1px solid rgb(192, 192, 192)',
                                                    borderRadius: '5px'
                                                }}>
                                                    <FormLabel id="lora_alpha-label">LoRA 缩放系数</FormLabel>
                                                    <div
                                                        style={{display: 'flex', flexFlow: 'row', paddingLeft: '10px'}}>
                                                        <Slider sx={{flexGrow: 1}}
                                                                value={typeof lora_alpha === 'number' ? lora_alpha : 1}
                                                                onChange={(e, newValue) => {
                                                                    setLora_alpha(newValue)
                                                                }}
                                                                step={1}
                                                                min={1}
                                                                max={2048}
                                                                type='number'
                                                                aria-labelledby="lora_alpha-slider"
                                                        />
                                                        <Input
                                                            sx={{
                                                                width: '80px',
                                                                marginLeft: '15px',
                                                                '& .MuiInputBase-input': {textAlign: 'center'}
                                                            }}
                                                            value={lora_alpha}
                                                            onChange={(e) => setLora_alpha(e.target.value)}
                                                            size="small"
                                                        />
                                                    </div>
                                                    <FormHelperText>LoRA 缩放系数大小</FormHelperText>
                                                </div>
                                            </FormControl>
                                        </Grid>
                                        <Grid item xs={3}>
                                            <FormControl variant="outlined" margin="dense" fullWidth>
                                                {/*<TextField*/}
                                                {/*    label="LoRA 随机丢弃"*/}
                                                {/*    value={lora_dropout}*/}
                                                {/*    helperText="LoRA 权重随机丢弃的概率"*/}
                                                {/*    onChange={(e) => setLora_dropout(e.target.value)}*/}
                                                {/*    size="small"*/}
                                                {/*/>*/}
                                                <div style={{
                                                    display: 'flex',
                                                    flexFlow: 'column',
                                                    padding: '5px',
                                                    border: '1px solid rgb(192, 192, 192)',
                                                    borderRadius: '5px'
                                                }}>
                                                    <FormLabel id="lora_dropout-label">LoRA 随机丢弃</FormLabel>
                                                    <div
                                                        style={{display: 'flex', flexFlow: 'row', paddingLeft: '10px'}}>
                                                        <Slider sx={{flexGrow: 1}}
                                                                value={typeof lora_dropout === 'number' ? lora_dropout : 0}
                                                                onChange={(e, newValue) => {
                                                                    setLora_dropout(newValue)
                                                                }}
                                                                step={0.01}
                                                                min={0}
                                                                max={1}
                                                                type='number'
                                                                aria-labelledby="lora_dropout-slider"
                                                        />
                                                        <Input
                                                            sx={{
                                                                width: '80px',
                                                                marginLeft: '15px',
                                                                '& .MuiInputBase-input': {textAlign: 'center'}
                                                            }}
                                                            value={lora_dropout}
                                                            onChange={(e) => setLora_dropout(e.target.value)}
                                                            size="small"
                                                        />
                                                    </div>
                                                    <FormHelperText>LoRA 权重随机丢弃的概率</FormHelperText>
                                                </div>
                                            </FormControl>
                                        </Grid>
                                        <Grid item xs={3}>
                                            <FormControl variant="outlined" margin="dense" fullWidth>
                                                {/*<TextField*/}
                                                {/*    label="LoRA+ 学习率比例"*/}
                                                {/*    value={loraplus_lr_ratio}*/}
                                                {/*    helperText="LoRA+ 中 B 矩阵的学习率倍数"*/}
                                                {/*    onChange={(e) => setLoraplus_lr_ratio(e.target.value)}*/}
                                                {/*    size="small"*/}
                                                {/*/>*/}
                                                <div style={{
                                                    display: 'flex',
                                                    flexFlow: 'column',
                                                    padding: '5px',
                                                    border: '1px solid rgb(192, 192, 192)',
                                                    borderRadius: '5px'
                                                }}>
                                                    <FormLabel id="loraplus_lr_ratio-label">LoRA+ 学习率比例</FormLabel>
                                                    <div
                                                        style={{display: 'flex', flexFlow: 'row', paddingLeft: '10px'}}>
                                                        <Slider sx={{flexGrow: 1}}
                                                                value={typeof loraplus_lr_ratio === 'number' ? loraplus_lr_ratio : 0}
                                                                onChange={(e, newValue) => {
                                                                    setLoraplus_lr_ratio(newValue)
                                                                }}
                                                                step={0.01}
                                                                min={0}
                                                                max={64}
                                                                type='number'
                                                                aria-labelledby="loraplus_lr_ratio-slider"
                                                        />
                                                        <Input
                                                            sx={{
                                                                width: '80px',
                                                                marginLeft: '15px',
                                                                '& .MuiInputBase-input': {textAlign: 'center'}
                                                            }}
                                                            value={loraplus_lr_ratio}
                                                            onChange={(e) => setLoraplus_lr_ratio(e.target.value)}
                                                            size="small"
                                                        />
                                                    </div>
                                                    <FormHelperText>LoRA+ 中 B 矩阵的学习率倍数</FormHelperText>
                                                </div>
                                            </FormControl>
                                        </Grid>
                                        <Grid item xs={2}>
                                            <FormControl variant="outlined" margin="dense" fullWidth>
                                                <FormControlLabel control={<Checkbox checked={create_new_adapter}
                                                                                     onChange={(e) => setCreate_new_adapter(e.target.checked)}/>}
                                                                  label="新建适配器"/>
                                            </FormControl>
                                        </Grid>
                                        <Grid item xs={2}>
                                            <FormControl variant="outlined" margin="dense" fullWidth>
                                                <FormControlLabel control={<Checkbox checked={use_rslora}
                                                                                     onChange={(e) => setUse_rslora(e.target.checked)}/>}
                                                                  label="使用 rslora"/>
                                            </FormControl>
                                        </Grid>
                                        <Grid item xs={2}>
                                            <FormControl variant="outlined" margin="dense" fullWidth>
                                                <FormControlLabel control={<Checkbox checked={use_dora}
                                                                                     onChange={(e) => setUse_dora(e.target.checked)}/>}
                                                                  label="使用 DoRA"/>
                                            </FormControl>
                                        </Grid>
                                        <Grid item xs={3}>
                                            <FormControl variant="outlined" margin="dense" fullWidth>
                                                <TextField
                                                    label="LoRA 作用模块"
                                                    value={lora_target}
                                                    helperText="应用 LoRA 的模块名称。使用英文逗号分隔多个名称"
                                                    onChange={(e) => setLora_target(e.target.value)}
                                                    size="small"
                                                />
                                            </FormControl>
                                        </Grid>
                                        <Grid item xs={3}>
                                            <FormControl variant="outlined" margin="dense" fullWidth>
                                                <TextField
                                                    label="附加模块"
                                                    value={additional_target}
                                                    helperText="除 LoRA 层以外的可训练模块名称。使用英文逗号分隔多个名称"
                                                    onChange={(e) => setAdditional_target(e.target.value)}
                                                    size="small"
                                                />
                                            </FormControl>
                                        </Grid>
                                    </Grid>
                                </AccordionDetails>
                            </Accordion>}
                            <Accordion>
                                <AccordionSummary
                                    expandIcon={<ExpandMoreIcon/>}
                                    aria-controls="panel1-content"
                                    id="panel1-header"
                                >
                                    RLHF参数设置
                                </AccordionSummary>
                                <AccordionDetails>
                                    <Grid container spacing={1}>
                                        {training_stage == 'dpo' && (<><Grid item xs={3}>
                                            <FormControl variant="outlined" margin="dense" fullWidth>
                                                {/*<TextField*/}
                                                {/*    label="DPO beta 参数"*/}
                                                {/*    value={dpo_beta}*/}
                                                {/*    helperText="DPO 损失函数中 beta 超参数大小"*/}
                                                {/*    onChange={(e) => setDpo_beta(e.target.value)}*/}
                                                {/*    size="small"*/}
                                                {/*/>*/}
                                                <div style={{
                                                    display: 'flex',
                                                    flexFlow: 'column',
                                                    padding: '5px',
                                                    border: '1px solid rgb(192, 192, 192)',
                                                    borderRadius: '5px'
                                                }}>
                                                    <FormLabel id="dpo_beta-label">DPO beta 参数</FormLabel>
                                                    <div
                                                        style={{display: 'flex', flexFlow: 'row', paddingLeft: '10px'}}>
                                                        <Slider sx={{flexGrow: 1}}
                                                                value={typeof dpo_beta === 'number' ? dpo_beta : 0}
                                                                onChange={(e, newValue) => {
                                                                    setDpo_beta(newValue)
                                                                }}
                                                                step={0.01}
                                                                min={0}
                                                                max={1}
                                                                type='number'
                                                                aria-labelledby="dpo_beta-slider"
                                                        />
                                                        <Input
                                                            sx={{
                                                                width: '80px',
                                                                marginLeft: '15px',
                                                                '& .MuiInputBase-input': {textAlign: 'center'}
                                                            }}
                                                            value={dpo_beta}
                                                            onChange={(e) => setDpo_beta(e.target.value)}
                                                            size="small"
                                                        />
                                                    </div>
                                                    <FormHelperText>DPO 损失函数中 beta 超参数大小</FormHelperText>
                                                </div>
                                            </FormControl>
                                        </Grid>
                                            <Grid item xs={3}>
                                                <FormControl variant="outlined" margin="dense" fullWidth>
                                                    {/*<TextField*/}
                                                    {/*    label="DPO-ftx 权重"*/}
                                                    {/*    value={dpo_ftx}*/}
                                                    {/*    helperText="DPO-ftx 中 SFT 损失的权重大小"*/}
                                                    {/*    onChange={(e) => setDpo_ftx(e.target.value)}*/}
                                                    {/*    size="small"*/}
                                                    {/*/>*/}
                                                    <div style={{
                                                        display: 'flex',
                                                        flexFlow: 'column',
                                                        padding: '5px',
                                                        border: '1px solid rgb(192, 192, 192)',
                                                        borderRadius: '5px'
                                                    }}>
                                                        <FormLabel id="dpo_ftx-label">DPO-ftx 权重</FormLabel>
                                                        <div style={{
                                                            display: 'flex',
                                                            flexFlow: 'row',
                                                            paddingLeft: '10px'
                                                        }}>
                                                            <Slider sx={{flexGrow: 1}}
                                                                    value={typeof dpo_ftx === 'number' ? dpo_ftx : 0}
                                                                    onChange={(e, newValue) => {
                                                                        setDpo_ftx(newValue)
                                                                    }}
                                                                    step={0.01}
                                                                    min={0}
                                                                    max={10}
                                                                    type='number'
                                                                    aria-labelledby="dpo_ftx-slider"
                                                            />
                                                            <Input
                                                                sx={{
                                                                    width: '80px',
                                                                    marginLeft: '15px',
                                                                    '& .MuiInputBase-input': {textAlign: 'center'}
                                                                }}
                                                                value={dpo_ftx}
                                                                onChange={(e) => setDpo_ftx(e.target.value)}
                                                                size="small"
                                                            />
                                                        </div>
                                                        <FormHelperText>DPO-ftx 中 SFT 损失的权重大小</FormHelperText>
                                                    </div>
                                                </FormControl>
                                            </Grid></>)}
                                        {training_stage == 'orpo' &&
                                            <Grid item xs={3}>
                                                <FormControl variant="outlined" margin="dense" fullWidth>
                                                    {/*<TextField*/}
                                                    {/*    label="ORPO beta 参数"*/}
                                                    {/*    value={orpo_beta}*/}
                                                    {/*    helperText="ORPO 损失函数中 beta 超参数大小"*/}
                                                    {/*    onChange={(e) => setOrpo_beta(e.target.value)}*/}
                                                    {/*    size="small"*/}
                                                    {/*/>*/}
                                                    <div style={{
                                                        display: 'flex',
                                                        flexFlow: 'column',
                                                        padding: '5px',
                                                        border: '1px solid rgb(192, 192, 192)',
                                                        borderRadius: '5px'
                                                    }}>
                                                        <FormLabel id="orpo_beta-label">ORPO beta 参数</FormLabel>
                                                        <div style={{
                                                            display: 'flex',
                                                            flexFlow: 'row',
                                                            paddingLeft: '10px'
                                                        }}>
                                                            <Slider sx={{flexGrow: 1}}
                                                                    value={typeof orpo_beta === 'number' ? orpo_beta : 0}
                                                                    onChange={(e, newValue) => {
                                                                        setOrpo_beta(newValue)
                                                                    }}
                                                                    step={0.01}
                                                                    min={0}
                                                                    max={1}
                                                                    type='number'
                                                                    aria-labelledby="orpo_beta-slider"
                                                            />
                                                            <Input
                                                                sx={{
                                                                    width: '80px',
                                                                    marginLeft: '15px',
                                                                    '& .MuiInputBase-input': {textAlign: 'center'}
                                                                }}
                                                                value={orpo_beta}
                                                                onChange={(e) => setOrpo_beta(e.target.value)}
                                                                size="small"
                                                            />
                                                        </div>
                                                        <FormHelperText>ORPO 损失函数中 beta 超参数大小</FormHelperText>
                                                    </div>
                                                </FormControl>
                                            </Grid>}
                                        {training_stage == 'ppo' && <Grid item xs={3}>
                                            <FormControl variant="outlined" margin="dense" fullWidth>
                                                <TextField
                                                    label="奖励模型"
                                                    value={reward_model}
                                                    helperText="PPO 训练中奖励模型的适配器路径"
                                                    onChange={(e) => setReward_model(e.target.value)}
                                                    size="small"
                                                />
                                                {/*<InputLabel id="reward_model-label">量化等级</InputLabel>*/}
                                                {/*<Select*/}
                                                {/*    labelId="reward_model-label"*/}
                                                {/*    value={reward_model}*/}
                                                {/*    onChange={(e) => setReward_model(e.target.value)}*/}
                                                {/*    label="量化等级"*/}
                                                {/*    size="small"*/}
                                                {/*>*/}
                                                {/*    {rewardModelOptions.map((item) => {*/}
                                                {/*        return (*/}
                                                {/*            <MenuItem key={item.value} value={item.value}>*/}
                                                {/*                {item.name}*/}
                                                {/*            </MenuItem>*/}
                                                {/*        )*/}
                                                {/*    })}*/}
                                                {/*</Select>*/}
                                            </FormControl>
                                        </Grid>}
                                    </Grid>
                                </AccordionDetails>
                            </Accordion>
                            <Accordion>
                                <AccordionSummary
                                    expandIcon={<ExpandMoreIcon/>}
                                    aria-controls="panel1-content"
                                    id="panel1-header"
                                >
                                    GaLore参数设置
                                </AccordionSummary>
                                <AccordionDetails>
                                    <Grid container spacing={1}>
                                        <Grid item xs={2}>
                                            <FormControl variant="outlined" margin="dense" fullWidth>
                                                <FormControlLabel control={<Checkbox checked={use_galore}
                                                                                     onChange={(e) => setUse_galore(e.target.checked)}/>}
                                                                  label="使用 GaLore"/>
                                            </FormControl>
                                        </Grid>
                                        {use_galore == true && <>
                                            <Grid item xs={2}>
                                                <FormControl variant="outlined" margin="dense" fullWidth>
                                                    {/*<TextField*/}
                                                    {/*    label="GaLore 秩"*/}
                                                    {/*    value={galore_rank}*/}
                                                    {/*    helperText="GaLore 梯度的秩大小"*/}
                                                    {/*    onChange={(e) => setGalore_rank(e.target.value)}*/}
                                                    {/*    size="small"*/}
                                                    {/*/>*/}
                                                    <div style={{
                                                        display: 'flex',
                                                        flexFlow: 'column',
                                                        padding: '5px',
                                                        border: '1px solid rgb(192, 192, 192)',
                                                        borderRadius: '5px'
                                                    }}>
                                                        <FormLabel id="galore_rank-label">GaLore 秩</FormLabel>
                                                        <div style={{
                                                            display: 'flex',
                                                            flexFlow: 'row',
                                                            paddingLeft: '10px'
                                                        }}>
                                                            <Slider sx={{flexGrow: 1}}
                                                                    value={typeof galore_rank === 'number' ? galore_rank : 1}
                                                                    onChange={(e, newValue) => {
                                                                        setGalore_rank(newValue)
                                                                    }}
                                                                    step={1}
                                                                    min={1}
                                                                    max={1024}
                                                                    type='number'
                                                                    aria-labelledby="galore_rank-slider"
                                                            />
                                                            <Input
                                                                sx={{
                                                                    width: '80px',
                                                                    marginLeft: '15px',
                                                                    '& .MuiInputBase-input': {textAlign: 'center'}
                                                                }}
                                                                value={galore_rank}
                                                                onChange={(e) => setGalore_rank(e.target.value)}
                                                                size="small"
                                                            />
                                                        </div>
                                                        <FormHelperText>GaLore 梯度的秩大小</FormHelperText>
                                                    </div>
                                                </FormControl>
                                            </Grid>
                                            <Grid item xs={2}>
                                                <FormControl variant="outlined" margin="dense" fullWidth>
                                                    {/*<TextField*/}
                                                    {/*    label="更新间隔"*/}
                                                    {/*    value={galore_update_interval}*/}
                                                    {/*    helperText="相邻两次投影更新的步数"*/}
                                                    {/*    onChange={(e) => setGalore_update_interval(e.target.value)}*/}
                                                    {/*    size="small"*/}
                                                    {/*/>*/}
                                                    <div style={{
                                                        display: 'flex',
                                                        flexFlow: 'column',
                                                        padding: '5px',
                                                        border: '1px solid rgb(192, 192, 192)',
                                                        borderRadius: '5px'
                                                    }}>
                                                        <FormLabel
                                                            id="galore_update_interval-label">更新间隔</FormLabel>
                                                        <div style={{
                                                            display: 'flex',
                                                            flexFlow: 'row',
                                                            paddingLeft: '10px'
                                                        }}>
                                                            <Slider sx={{flexGrow: 1}}
                                                                    value={typeof galore_update_interval === 'number' ? galore_update_interval : 1}
                                                                    onChange={(e, newValue) => {
                                                                        setGalore_update_interval(newValue)
                                                                    }}
                                                                    step={1}
                                                                    min={1}
                                                                    max={1024}
                                                                    type='number'
                                                                    aria-labelledby="galore_update_interval-slider"
                                                            />
                                                            <Input
                                                                sx={{
                                                                    width: '80px',
                                                                    marginLeft: '15px',
                                                                    '& .MuiInputBase-input': {textAlign: 'center'}
                                                                }}
                                                                value={galore_update_interval}
                                                                onChange={(e) => setGalore_update_interval(e.target.value)}
                                                                size="small"
                                                            />
                                                        </div>
                                                        <FormHelperText>相邻两次投影更新的步数</FormHelperText>
                                                    </div>
                                                </FormControl>
                                            </Grid>
                                            <Grid item xs={3}>
                                                <FormControl variant="outlined" margin="dense" fullWidth>
                                                    {/*<TextField*/}
                                                    {/*    label="GaLore 缩放系数"*/}
                                                    {/*    value={galore_scale}*/}
                                                    {/*    helperText="GaLore 缩放系数大小"*/}
                                                    {/*    onChange={(e) => setGalore_scale(e.target.value)}*/}
                                                    {/*    size="small"*/}
                                                    {/*/>*/}
                                                    <div style={{
                                                        display: 'flex',
                                                        flexFlow: 'column',
                                                        padding: '5px',
                                                        border: '1px solid rgb(192, 192, 192)',
                                                        borderRadius: '5px'
                                                    }}>
                                                        <FormLabel id="galore_scale-label">GaLore 缩放系数</FormLabel>
                                                        <div style={{
                                                            display: 'flex',
                                                            flexFlow: 'row',
                                                            paddingLeft: '10px'
                                                        }}>
                                                            <Slider sx={{flexGrow: 1}}
                                                                    value={typeof galore_scale === 'number' ? galore_scale : 0}
                                                                    onChange={(e, newValue) => {
                                                                        setGalore_scale(newValue)
                                                                    }}
                                                                    step={0.01}
                                                                    min={0}
                                                                    max={1}
                                                                    type='number'
                                                                    aria-labelledby="galore_scale-slider"
                                                            />
                                                            <Input
                                                                sx={{
                                                                    width: '80px',
                                                                    marginLeft: '15px',
                                                                    '& .MuiInputBase-input': {textAlign: 'center'}
                                                                }}
                                                                value={galore_scale}
                                                                onChange={(e) => setGalore_scale(e.target.value)}
                                                                size="small"
                                                            />
                                                        </div>
                                                        <FormHelperText>GaLore 缩放系数大小</FormHelperText>
                                                    </div>
                                                </FormControl>
                                            </Grid>
                                            <Grid item xs={3}>
                                                <FormControl variant="outlined" margin="dense" fullWidth>
                                                    <TextField
                                                        label="GaLore 作用模块"
                                                        value={galore_target}
                                                        helperText="应用 GaLore 的模块名称,使用英文逗号分隔多个名称"
                                                        onChange={(e) => setGalore_target(e.target.value)}
                                                        size="small"
                                                    />
                                                </FormControl>
                                            </Grid>
                                        </>}
                                    </Grid>
                                </AccordionDetails>
                            </Accordion>
                            <Accordion>
                                <AccordionSummary
                                    expandIcon={<ExpandMoreIcon/>}
                                    aria-controls="panel1-content"
                                    id="panel1-header"
                                >
                                    BAdam参数设置
                                </AccordionSummary>
                                <AccordionDetails>
                                    <Grid container spacing={1}>
                                        <Grid item xs={2}>
                                            <FormControl variant="outlined" margin="dense" fullWidth>
                                                <FormControlLabel control={<Checkbox checked={use_badam}
                                                                                     onChange={(e) => setUse_badam(e.target.checked)}/>}
                                                                  label="使用 BAdam"/>
                                            </FormControl>
                                        </Grid>
                                        {use_badam == true && <>
                                            <Grid item xs={2}>
                                                <FormControl variant="outlined" margin="dense" fullWidth>
                                                    <InputLabel id="badam_mode-label">BAdam 模式</InputLabel>
                                                    <Select
                                                        labelId="badam_mode-label"
                                                        value={badam_mode}
                                                        onChange={(e) => setBadam_mode(e.target.value)}
                                                        label="BAdam 模式"
                                                        helperText="使用 layer-wise 或 ratio-wise BAdam 优化器"
                                                        size="small"
                                                    >
                                                        {badamModeOptions.map((item) => {
                                                            return (
                                                                <MenuItem key={item.value} value={item.value}>
                                                                    {item.name}
                                                                </MenuItem>
                                                            )
                                                        })}
                                                    </Select>
                                                </FormControl>
                                            </Grid>
                                            <Grid item xs={2}>
                                                <FormControl variant="outlined" margin="dense" fullWidth>
                                                    <InputLabel id="badam_switch_mode-label">切换策略</InputLabel>
                                                    <Select
                                                        labelId="badam_switch_mode-label"
                                                        value={badam_switch_mode}
                                                        onChange={(e) => setBadam_switch_mode(e.target.value)}
                                                        label="切换策略"
                                                        helperText="Layer-wise BAdam 优化器的块切换策略"
                                                        size="small"
                                                    >
                                                        {badamSwitchModeOptions.map((item) => {
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
                                                    {/*<TextField*/}
                                                    {/*    label="切换频率"*/}
                                                    {/*    value={badam_switch_interval}*/}
                                                    {/*    helperText="Layer-wise BAdam 优化器的块切换频率"*/}
                                                    {/*    onChange={(e) => setBadam_switch_interval(e.target.value)}*/}
                                                    {/*    size="small"*/}
                                                    {/*/>*/}
                                                    <div style={{
                                                        display: 'flex',
                                                        flexFlow: 'column',
                                                        padding: '5px',
                                                        border: '1px solid rgb(192, 192, 192)',
                                                        borderRadius: '5px'
                                                    }}>
                                                        <FormLabel id="badam_switch_interval-label">切换频率</FormLabel>
                                                        <div style={{
                                                            display: 'flex',
                                                            flexFlow: 'row',
                                                            paddingLeft: '10px'
                                                        }}>
                                                            <Slider sx={{flexGrow: 1}}
                                                                    value={typeof badam_switch_interval === 'number' ? badam_switch_interval : 1}
                                                                    onChange={(e, newValue) => {
                                                                        setBadam_switch_interval(newValue)
                                                                    }}
                                                                    step={1}
                                                                    min={1}
                                                                    max={1024}
                                                                    type='number'
                                                                    aria-labelledby="badam_switch_interval-slider"
                                                            />
                                                            <Input
                                                                sx={{
                                                                    width: '80px',
                                                                    marginLeft: '15px',
                                                                    '& .MuiInputBase-input': {textAlign: 'center'}
                                                                }}
                                                                value={badam_switch_interval}
                                                                onChange={(e) => setBadam_switch_interval(e.target.value)}
                                                                size="small"
                                                            />
                                                        </div>
                                                        <FormHelperText>Layer-wise BAdam
                                                            优化器的块切换频率</FormHelperText>
                                                    </div>
                                                </FormControl>
                                            </Grid>
                                            <Grid item xs={3}>
                                                <FormControl variant="outlined" margin="dense" fullWidth>
                                                    {/*<TextField*/}
                                                    {/*    label="Block 更新比例"*/}
                                                    {/*    value={badam_update_ratio}*/}
                                                    {/*    helperText="Ratio-wise BAdam 优化器的更新比例"*/}
                                                    {/*    onChange={(e) => setBadam_update_ratio(e.target.value)}*/}
                                                    {/*    size="small"*/}
                                                    {/*/>*/}
                                                    <div style={{
                                                        display: 'flex',
                                                        flexFlow: 'column',
                                                        padding: '5px',
                                                        border: '1px solid rgb(192, 192, 192)',
                                                        borderRadius: '5px'
                                                    }}>
                                                        <FormLabel id="badam_update_ratio-label">Block
                                                            更新比例</FormLabel>
                                                        <div style={{
                                                            display: 'flex',
                                                            flexFlow: 'row',
                                                            paddingLeft: '10px'
                                                        }}>
                                                            <Slider sx={{flexGrow: 1}}
                                                                    value={typeof badam_update_ratio === 'number' ? badam_update_ratio : 0}
                                                                    onChange={(e, newValue) => {
                                                                        setBadam_update_ratio(newValue)
                                                                    }}
                                                                    step={0.01}
                                                                    min={0}
                                                                    max={1}
                                                                    type='number'
                                                                    aria-labelledby="badam_update_ratio-slider"
                                                            />
                                                            <Input
                                                                sx={{
                                                                    width: '80px',
                                                                    marginLeft: '15px',
                                                                    '& .MuiInputBase-input': {textAlign: 'center'}
                                                                }}
                                                                value={badam_update_ratio}
                                                                onChange={(e) => setBadam_update_ratio(e.target.value)}
                                                                size="small"
                                                            />
                                                        </div>
                                                        <FormHelperText>Ratio-wise BAdam
                                                            优化器的更新比例</FormHelperText>
                                                    </div>
                                                </FormControl>
                                            </Grid>
                                        </>
                                        }
                                    </Grid>
                                </AccordionDetails>
                            </Accordion>
                        </Paper>
                        <Paper elevation={2} style={{padding: "20px", marginTop: "10px"}}>
                            <Grid container spacing={1}>
                                <Grid item xs={8}>
                                    {/*<FormControl variant="outlined" margin="dense" fullWidth>*/}
                                    {/*    <TextField*/}
                                    {/*        label="输出目录"*/}
                                    {/*        value={output_dir}*/}
                                    {/*        helperText="保存结果的路径"*/}
                                    {/*        onChange={(e) => setOutput_dir(e.target.value)}*/}
                                    {/*        size="small"*/}
                                    {/*    />*/}
                                    {/*</FormControl>*/}
                                </Grid>
                                <Grid item xs={4}>
                                    <FormControl variant="outlined" margin="dense" fullWidth>
                                        <div style={{display: 'flex'}}>
                                            {/*<TextField*/}
                                            {/*    label="配置路径"*/}
                                            {/*    value={config_path}*/}
                                            {/*    style={{flexGrow: 1}}*/}
                                            {/*    helperText=""*/}
                                            {/*    onChange={(e) => setConfig_path(e.target.value)}*/}
                                            {/*    size="small"*/}
                                            {/*/>*/}
                                            {/*<Button*/}
                                            {/*    variant="contained"*/}
                                            {/*    size="small"*/}
                                            {/*    endIcon={<VisibilitySharpIcon/>}*/}
                                            {/*    className="addBtn"*/}
                                            {/*    onClick={handleViewDataset}*/}
                                            {/*>*/}
                                            {/*    保存训练参数*/}
                                            {/*</Button>*/}
                                            {/*<Button*/}
                                            {/*    variant="contained"*/}
                                            {/*    size="small"*/}
                                            {/*    sx={{display: 'none'}}*/}
                                            {/*    endIcon={<VisibilitySharpIcon/>}*/}
                                            {/*    className="addBtn"*/}
                                            {/*    onClick={handleViewDataset}*/}
                                            {/*>*/}
                                            {/*    载入训练参数*/}
                                            {/*</Button>*/}
                                            <LoadingButton
                                                variant="contained"
                                                size="small"
                                                endIcon={<RocketLaunchIcon/>}
                                                className="addBtn"
                                                loading={loading}
                                                loadingPosition="end"
                                                onClick={() => {
                                                    setConfirmType(3);
                                                    setIsShowConfirm(true);
                                                }}
                                            >
                                                模型训练
                                            </LoadingButton>
                                            <Button
                                                disabled={!isHighEnable}
                                                variant="contained"
                                                size="small"
                                                endIcon={<CancelIcon/>}
                                                className="addBtn"
                                                onClick={() => {
                                                    setConfirmType(4);
                                                    setIsShowConfirm(true);
                                                }}
                                            >
                                                中止训练
                                            </Button>
                                        </div>
                                    </FormControl>
                                </Grid>
                            </Grid>
                        </Paper>
                        <Paper elevation={2} style={{padding: "20px", marginTop: "10px"}}>
                            <Grid container spacing={1}>
                                {isHighShowChart && (
                                    <Grid item xs={6}>
                                        <Paper elevation={3} style={{padding: '18px'}}>
                                            <Typography sx={{mt: 4, mb: 2}} style={{marginTop: '0px'}} variant="h3"
                                                        component="div">训练结果</Typography>
                                            <LineChart
                                                xAxis={[{data: xHighAxis}]}
                                                series={[
                                                    {
                                                        data: yHighAxis,
                                                    },
                                                ]}
                                                width={undefined}
                                                height={320}
                                            />
                                        </Paper>
                                    </Grid>)}
                                {isHighShowChart && (
                                    <Grid item xs={6}>
                                        <Paper elevation={3} style={{padding: '18px'}}>
                                            <Typography sx={{mt: 4, mb: 2}} style={{marginTop: '0px'}} variant="h3"
                                                        component="div">结果明细</Typography>
                                            <List ref={listHighRef} dense={false}
                                                  style={{height: "320px", overflow: "auto"}}>
                                                {
                                                    returnHighContent.map((item) => {
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
                                )}
                            </Grid>
                        </Paper>
                    </Box>
                </TabPanel>
            </TabContext>

            <Drawer
                open={isShow}
                onClose={() => {
                    setIsShow(false)
                }}
                anchor={'right'}
            >
                <div style={styles.drawerCard}>
                    <Box
                        ref={parentRef}
                        style={styles.formContainer}
                        display="flex"
                        flexDirection="column"
                        width="100%"
                        mx="auto"
                    >
                        <Grid rowSpacing={0} columnSpacing={1}>

                        </Grid>
                    </Box>
                    <Box style={styles.buttonsContainer}>
                        <button
                            title="Launch"
                            style={styles.buttonContainer}
                            onClick={() => setIsShow(false)}
                        >
                            <Box style={styles.buttonItem}>
                                <RocketLaunchOutlined color="#000000" size="20px"/>
                            </Box>
                        </button>
                        <button
                            title="Go Back"
                            style={styles.buttonContainer}
                            onClick={() => {
                                setIsShow(false)
                            }}
                        >
                            <Box style={styles.buttonItem}>
                                <UndoOutlined color="#000000" size="20px"/>
                            </Box>
                        </button>
                    </Box>
                </div>
            </Drawer>

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

export default TrainDetail
