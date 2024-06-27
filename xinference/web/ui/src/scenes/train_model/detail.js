import {
    Box,
    Button,
    // ButtonGroup,
    // ClickAwayListener,
    Drawer,
    FormControl,
    Grid,
    Select,
    InputLabel,
    MenuItem,
    // Grow,
    // MenuList,
    // Popper,
    // Stack,
    TextField,
    OutlinedInput,
    ListItemText,
    Tab,
    Accordion,
    AccordionSummary,
    AccordionDetails,
    FormLabel,
    RadioGroup,
    FormControlLabel, Radio
} from '@mui/material'
import React, {useContext, useEffect, useRef, useState} from 'react'
import {useCookies} from 'react-cookie'
import {useNavigate, useParams} from 'react-router-dom'
import VisibilitySharpIcon from '@mui/icons-material/VisibilitySharp';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import CancelIcon from '@mui/icons-material/Cancel';
import RocketLaunchIcon from '@mui/icons-material/RocketLaunch';
// import DeleteOutlineOutlinedIcon from '@mui/icons-material/DeleteOutlineOutlined'
// // import OpenInBrowserOutlinedIcon from '@mui/icons-material/OpenInBrowserOutlined'
// import ArrowDropDownIcon from '@mui/icons-material/ArrowDropDown';
// import BorderColorIcon from '@mui/icons-material/BorderColor';
// import {DataGrid} from '@mui/x-data-grid'

import {ApiContext} from '../../components/apiContext'
import ErrorMessageSnackBar from '../../components/errorMessageSnackBar'
import fetcher from '../../components/fetcher'
import Title from '../../components/Title'
// import HotkeyFocusTextField from "../../components/hotkeyFocusTextField";
// import AddIcon from "@mui/icons-material/Add";
import styles from "./styles/modelCardStyle";
import {RocketLaunchOutlined, UndoOutlined} from "@mui/icons-material";
import Checkbox from '@mui/material/Checkbox';
import {TabContext, TabList, TabPanel} from "@mui/lab";
import Paper from "@mui/material/Paper";
// import Paper from "@mui/material/Paper";


const TrainDetail = () => {
    const {id} = useParams();
    const name = id;
    console.log(id)
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
    //语言类型
    const langOptions = [{name: "zh", value: "zh"}, {name: "en", value: "en"}, {name: "ru", value: "ru"}];
    //模型语言
    const [modelLanguage, setModelLanguage] = useState('zh');
    //模型集合
    // const [modelList,setModelList]=useState([])
    //模型名称
    const [modelName, setModelName] = useState(name);
    //模型路径
    const [modelPath, setModelPath] = useState('');
    //训练轮数
    const [trainingRound, setTrainingRound] = useState(3);
    //数据集集合
    const [datasetList, setDatasetList] = useState([]);
    //数据集
    const [dataset, setDataset] = useState([]);

    //高级训练
    //语言
    const [lang, setLang] = useState('')
    //模型名称
    const [model_name, setModel_name] = useState('')
    //模型路径
    const [model_path, setModel_path] = useState('')
    //微调方法类型
    const finetuningTypeOptions = [{name: 'full', value: 'full'}, {name: 'lora', value: 'lora'}, {
        name: 'freeze',
        value: 'freeze'
    }]
    //微调方法
    const [finetuning_type, setFinetuning_type] = useState('lora')
    //适配器路径
    const [adapter_path, setAdapter_path] = useState('')
    //量化等级选项
    const quantizationBitOptions = [{name: "none", value: "none"}, {name: "8", value: "8"}, {name: "4", value: "4"}]
    //量化等级
    const [quantization_bit, setQuantization_bit] = useState('none')
    //提示模版选项
    const templateOptions = useState([{name: 'default', value: 'default'}])
    //提示模版
    const [template, setTemplate] = useState('default')
    //ROPE插值方法选项
    // const ropeScalingOptions=[{name:'none',value:'none'},{name:'linear',value:'linear'},{name:'dynamic',value:'dynamic'}]
    //ROPE插值方法
    const [rope_scaling, setRope_scaling] = useState('')
    //加速方式选项
    //const boosterOptions=[{name:'none',value:'none'},{name:'flashattn2',value:'flashattn2'},{name:'unsloth',value:'unsloth'}]
    //加速方式
    const [booster, setBooster] = useState('none')
    //Train
    //训练阶段选项
    const trainingStageOptions = [{name: 'PPO', value: 'PPO'}, {name: 'ORPO', value: 'ORPO'}]
    //训练阶段
    const [training_stage, setTraining_stage] = useState('')

    //数据路径
    const [dataset_dir, setDataset_dir] = useState('')

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
    const lrSchedulerTypeOptions = [{name: 'cosine', value: 'cosine'}]
    //学习率调节器
    const [lr_scheduler_type, setLr_scheduler_type] = useState('')
    //其它参数设置
    //日志间隔
    const [logging_steps, setLogging_steps] = useState('5')
    //保存间隔
    const [save_steps, setSave_steps] = useState('100')
    //预热步数
    const [warmup_steps, setWarmup_steps] = useState('0')
    //NEFTune噪声参数
    const [neftune_alpha, setNeftune_alpha] = useState('0')
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
    const [use_llama_pro, setUse_llama_pro] = useState(false)
    //启用外部记录面板
    const [report_to, setReport_to] = useState(false)
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
    const rewardModelOptions = []
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
    const [badam_mode, setBadam_mode] = useState('')
    //切换策略选项
    const badamSwitchModeOptions = [{name: "ascending", value: "ascending"}, {
        name: "descending",
        value: "descending"
    }, {name: "random", value: "random"}, {name: "fixed", value: "fixed"}]
    //切换策略
    const [badam_switch_mode, setBadam_switch_mode] = useState('')
    //切换频率
    const [badam_switch_interval, setBadam_switch_interval] = useState('50')
    //Block 更新比例
    const [badam_update_ratio, setBadam_update_ratio] = useState('0.05')
    //输出目录
    const [output_dir, setOutput_dir] = useState('')
    //配置路径
    const [config_path, setConfig_path] = useState('')

    //新增数据是否显示抽屉
    const [isShow, setIsShow] = useState(false)
    const [isEnable, setIsEnable] = useState(false);
    //页签切换
    const handleTabChange = (event, newValue) => {
        setValue(newValue)
    }
    //预览数据集
    const handleViewDataset = () => {
        setIsShow(true)
    }
    //模型训练
    const handleTrainModel = () => {
        if (isCallingApi || isUpdatingModel)
            return
        setIsEnable(true);
        setIsCallingApi(true);
    }
    const handleStopTrain = () => {
        setIsEnable(false);
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
    // useEffect(() => {
    //     setDatasetList([{name: 'TEST', value: 'TEST'}]);
    // },[])
    return (
        <Box m="20px">
            <div style={{display: 'flex'}}>
                <div style={{cursor: 'pointer'}} onClick={goBack}><Title title={'模型训练 / '}/></div>
                <Title title={' ' + name} color="text.primary"/>
            </div>
            <ErrorMessageSnackBar/>
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
                        <Paper elevation={4} style={{padding: "20px"}}>
                            <Grid container spacing={1}>
                                <Grid item xs={2}>
                                    <FormControl variant="outlined" margin="dense" fullWidth>
                                        <InputLabel id="modelLanguage-label">语言</InputLabel>
                                        <Select
                                            labelId="modelLanguage-label"
                                            value={modelLanguage}
                                            onChange={(e) => setModelLanguage(e.target.value)}
                                            label="语言"
                                            size="small"
                                        >
                                            {langOptions.map((item) => {
                                                return (
                                                    <MenuItem key={item.value} value={item.value}>
                                                        {item.name}
                                                    </MenuItem>
                                                )
                                            })}
                                        </Select>
                                    </FormControl>
                                </Grid>
                                <Grid item xs={5}>
                                    <FormControl variant="outlined" margin="dense" fullWidth>
                                        <TextField
                                            label="模型名称"
                                            value={modelName}
                                            onChange={(e) => setModelName(e.target.value)}
                                            size="small"
                                        />
                                    </FormControl>
                                </Grid>
                                <Grid item xs={5}>
                                    <FormControl variant="outlined" margin="dense" fullWidth>
                                        <TextField
                                            label="模型路径"
                                            value={modelPath}
                                            helperText="本地模型的文件路径"
                                            onChange={(e) => setModelPath(e.target.value)}
                                            size="small"
                                        />
                                    </FormControl>
                                </Grid>
                                <Grid item xs={2}>
                                    <FormControl variant="outlined" margin="dense" fullWidth>
                                        <TextField
                                            label="训练轮数"
                                            value={trainingRound}
                                            helperText="需要执行的训练轮数"
                                            onChange={(e) => setTrainingRound(e.target.value)}
                                            size="small"
                                        />
                                    </FormControl>
                                </Grid>
                                <Grid item xs={10}>
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

                                            <Button
                                                variant="contained"
                                                size="small"
                                                endIcon={<VisibilitySharpIcon/>}
                                                className="addBtn"
                                                onClick={handleViewDataset}
                                            >
                                                预览数据集
                                            </Button>
                                            <Button
                                                variant="contained"
                                                size="small"
                                                endIcon={<RocketLaunchIcon/>}
                                                className="addBtn"
                                                onClick={handleTrainModel}
                                            >
                                                模型训练
                                            </Button>
                                            <Button
                                                enabled={isEnable}
                                                variant="contained"
                                                size="small"
                                                endIcon={<CancelIcon/>}
                                                className="addBtn"
                                                onClick={handleStopTrain}
                                            >
                                                中止训练
                                            </Button>
                                        </div>
                                    </FormControl>
                                </Grid>
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
                        <Paper elevation={4} style={{padding: "20px"}}>
                            <Grid container spacing={1}>
                                <Grid item xs={2}>
                                    <FormControl variant="outlined" margin="dense" fullWidth>
                                        <InputLabel id="lang-label">语言</InputLabel>
                                        <Select
                                            labelId="lang-label"
                                            value={lang}
                                            onChange={(e) => setLang(e.target.value)}
                                            label="语言"
                                            size="small"
                                        >
                                            {langOptions.map((item) => {
                                                return (
                                                    <MenuItem key={item.value} value={item.value}>
                                                        {item.name}
                                                    </MenuItem>
                                                )
                                            })}
                                        </Select>
                                    </FormControl>
                                </Grid>
                                <Grid item xs={5}>
                                    <FormControl variant="outlined" margin="dense" fullWidth>
                                        <TextField
                                            label="模型名称"
                                            value={model_name}
                                            onChange={(e) => setModel_name(e.target.value)}
                                            size="small"
                                        />
                                    </FormControl>
                                </Grid>
                                <Grid item xs={5}>
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
                                <Grid item xs={10}>
                                    <FormControl variant="outlined" margin="dense" fullWidth>
                                        <div style={{display: 'flex'}}>
                                            <TextField
                                                label="适配器路径"
                                                value={adapter_path}
                                                style={{flexGrow:1}}
                                                helperText=""
                                                onChange={(e) => setAdapter_path(e.target.value)}
                                                size="small"
                                            />
                                            <Button
                                                variant="contained"
                                                size="small"
                                                endIcon={<VisibilitySharpIcon/>}
                                                className="addBtn"
                                                onClick={handleViewDataset}
                                            >
                                                刷新适配器
                                            </Button>
                                        </div>
                                    </FormControl>
                                </Grid>
                            </Grid>
                        </Paper>

                        <Paper elevation={4} style={{padding: "20px", marginTop: "10px"}}>
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
                                            <FormControl variant="outlined" margin="dense" style={{marginTop:'0px'}} fullWidth>
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
                                            <FormControl variant="outlined" margin="dense" style={{marginTop:'0px'}}  fullWidth>
                                                <FormLabel id="booster-label">加速方式</FormLabel>
                                                <RadioGroup
                                                    row
                                                    value={booster}
                                                    onChange={(e) => setBooster(e.target.value)}
                                                    aria-labelledby="booster-label"
                                                    name="booster"
                                                >
                                                    <FormControlLabel value="none" control={<Radio/>} label="none"/>
                                                    <FormControlLabel value="flashattn2" control={<Radio/>}
                                                                      label="flashattn2"/>
                                                    <FormControlLabel value="unsloth" control={<Radio/>}
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
                                        <Grid item xs={3}>
                                            <FormControl variant="outlined" margin="dense" fullWidth>
                                                <TextField
                                                    label="数据路径"
                                                    value={dataset_dir}
                                                    helperText="数据文件夹的路径"
                                                    onChange={(e) => setDataset_dir(e.target.value)}
                                                    size="small"
                                                />
                                            </FormControl>
                                        </Grid>
                                        <Grid item xs={6}>
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

                                                    <Button
                                                        variant="contained"
                                                        size="small"
                                                        endIcon={<VisibilitySharpIcon/>}
                                                        className="addBtn"
                                                        onClick={handleViewDataset}
                                                    >
                                                        预览数据集
                                                    </Button>
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
                                                <TextField
                                                    label="截断长度"
                                                    value={cutoff_len}
                                                    helperText="输入序列分词后的最大长度"
                                                    onChange={(e) => setCutoff_len(e.target.value)}
                                                    size="small"
                                                />
                                            </FormControl>
                                        </Grid>
                                        <Grid item xs={3}>
                                            <FormControl variant="outlined" margin="dense" fullWidth>
                                                <TextField
                                                    label="批处理大小"
                                                    value={batch_size}
                                                    helperText="每个 GPU 处理的样本数量"
                                                    onChange={(e) => setBatch_size(e.target.value)}
                                                    size="small"
                                                />
                                            </FormControl>
                                        </Grid>
                                        <Grid item xs={3}>
                                            <FormControl variant="outlined" margin="dense" fullWidth>
                                                <TextField
                                                    label="梯度累积"
                                                    value={gradient_accumulation_steps}
                                                    helperText="梯度累积的步数"
                                                    onChange={(e) => setGradient_accumulation_steps(e.target.value)}
                                                    size="small"
                                                />
                                            </FormControl>
                                        </Grid>

                                        <Grid item xs={3}>
                                            <FormControl variant="outlined" margin="dense" fullWidth>
                                                <TextField
                                                    label="验证集比例"
                                                    value={val_size}
                                                    helperText="验证集占全部样本的百分比"
                                                    onChange={(e) => setVal_size(e.target.value)}
                                                    size="small"
                                                />
                                            </FormControl>
                                        </Grid>
                                        <Grid item xs={3}>
                                            <FormControl variant="outlined" margin="dense" fullWidth>
                                                <InputLabel id="lr_scheduler_type-label">计算类型</InputLabel>
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
                                                <TextField
                                                    label="日志间隔"
                                                    value={logging_steps}
                                                    helperText="每两次日志输出间的更新步数"
                                                    onChange={(e) => setLogging_steps(e.target.value)}
                                                    size="small"
                                                />
                                            </FormControl>
                                        </Grid>
                                        <Grid item xs={3}>
                                            <FormControl variant="outlined" margin="dense" fullWidth>
                                                <TextField
                                                    label="保存间隔"
                                                    value={save_steps}
                                                    helperText="每两次断点保存间的更新步数"
                                                    onChange={(e) => setSave_steps(e.target.value)}
                                                    size="small"
                                                />
                                            </FormControl>
                                        </Grid>
                                        <Grid item xs={3}>
                                            <FormControl variant="outlined" margin="dense" fullWidth>
                                                <TextField
                                                    label="预热步数"
                                                    value={warmup_steps}
                                                    helperText="学习率预热采用的步数"
                                                    onChange={(e) => setWarmup_steps(e.target.value)}
                                                    size="small"
                                                />
                                            </FormControl>
                                        </Grid>
                                        <Grid item xs={3}>
                                            <FormControl variant="outlined" margin="dense" fullWidth>
                                                <TextField
                                                    label="NEFTune 噪声参数"
                                                    value={neftune_alpha}
                                                    helperText="嵌入向量所添加的噪声大小"
                                                    onChange={(e) => setNeftune_alpha(e.target.value)}
                                                    size="small"
                                                />
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
                                        <Grid item xs={3}>
                                            <FormControl variant="outlined" margin="dense" fullWidth>
                                                <FormControlLabel control={<Checkbox checked={use_llama_pro}
                                                                                     onChange={(e) => setUse_llama_pro(e.target.checked)}/>}
                                                                  label="使用 LLaMA Pro"/>
                                            </FormControl>
                                        </Grid>

                                        <Grid item xs={3}>
                                            <FormControl variant="outlined" margin="dense" fullWidth>
                                                <FormControlLabel control={<Checkbox checked={shift_attn}
                                                                                     onChange={(e) => setShift_attn(e.target.checked)}/>}
                                                                  label="使用 S^2 Attention"/>
                                            </FormControl>
                                        </Grid>
                                        <Grid item xs={3}>
                                            <FormControl variant="outlined" margin="dense" fullWidth>
                                                <FormControlLabel control={<Checkbox checked={report_to}
                                                                                     onChange={(e) => setReport_to(e.target.checked)}/>}
                                                                  label="启用外部记录面板"/>
                                            </FormControl>
                                        </Grid>
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
                            <Accordion>
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
                                                <TextField
                                                    label="可训练层数"
                                                    value={freeze_trainable_layers}
                                                    helperText="最末尾（+）/最前端（-）可训练隐藏层的数量"
                                                    onChange={(e) => setFreeze_trainable_layers(e.target.value)}
                                                    size="small"
                                                />
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
                            </Accordion>
                            <Accordion>
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
                                                <TextField
                                                    label="LoRA 秩"
                                                    value={lora_rank}
                                                    helperText="LoRA 矩阵的秩大小"
                                                    onChange={(e) => setLora_rank(e.target.value)}
                                                    size="small"
                                                />
                                            </FormControl>
                                        </Grid>
                                        <Grid item xs={3}>
                                            <FormControl variant="outlined" margin="dense" fullWidth>
                                                <TextField
                                                    label="LoRA 缩放系数"
                                                    value={lora_alpha}
                                                    helperText="LoRA 缩放系数大小"
                                                    onChange={(e) => setLora_alpha(e.target.value)}
                                                    size="small"
                                                />
                                            </FormControl>
                                        </Grid>
                                        <Grid item xs={3}>
                                            <FormControl variant="outlined" margin="dense" fullWidth>
                                                <TextField
                                                    label="LoRA 随机丢弃"
                                                    value={lora_dropout}
                                                    helperText="LoRA 权重随机丢弃的概率"
                                                    onChange={(e) => setLora_dropout(e.target.value)}
                                                    size="small"
                                                />
                                            </FormControl>
                                        </Grid>
                                        <Grid item xs={3}>
                                            <FormControl variant="outlined" margin="dense" fullWidth>
                                                <TextField
                                                    label="LoRA+ 学习率比例"
                                                    value={loraplus_lr_ratio}
                                                    helperText="LoRA+ 中 B 矩阵的学习率倍数"
                                                    onChange={(e) => setLoraplus_lr_ratio(e.target.value)}
                                                    size="small"
                                                />
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
                            </Accordion>
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
                                        <Grid item xs={3}>
                                            <FormControl variant="outlined" margin="dense" fullWidth>
                                                <TextField
                                                    label="DPO beta 参数"
                                                    value={dpo_beta}
                                                    helperText="DPO 损失函数中 beta 超参数大小"
                                                    onChange={(e) => setDpo_beta(e.target.value)}
                                                    size="small"
                                                />
                                            </FormControl>
                                        </Grid>
                                        <Grid item xs={3}>
                                            <FormControl variant="outlined" margin="dense" fullWidth>
                                                <TextField
                                                    label="DPO-ftx 权重"
                                                    value={dpo_ftx}
                                                    helperText="DPO-ftx 中 SFT 损失的权重大小"
                                                    onChange={(e) => setDpo_ftx(e.target.value)}
                                                    size="small"
                                                />
                                            </FormControl>
                                        </Grid>
                                        <Grid item xs={3}>
                                            <FormControl variant="outlined" margin="dense" fullWidth>
                                                <TextField
                                                    label="ORPO beta 参数"
                                                    value={orpo_beta}
                                                    helperText="ORPO 损失函数中 beta 超参数大小"
                                                    onChange={(e) => setOrpo_beta(e.target.value)}
                                                    size="small"
                                                />
                                            </FormControl>
                                        </Grid>
                                        <Grid item xs={3}>
                                            <FormControl variant="outlined" margin="dense" fullWidth>
                                                <InputLabel id="reward_model-label">量化等级</InputLabel>
                                                <Select
                                                    labelId="reward_model-label"
                                                    value={reward_model}
                                                    onChange={(e) => setReward_model(e.target.value)}
                                                    label="量化等级"
                                                    size="small"
                                                >
                                                    {rewardModelOptions.map((item) => {
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
                                        <Grid item xs={2}>
                                            <FormControl variant="outlined" margin="dense" fullWidth>
                                                <TextField
                                                    label="GaLore 秩"
                                                    value={galore_rank}
                                                    helperText="GaLore 梯度的秩大小"
                                                    onChange={(e) => setGalore_rank(e.target.value)}
                                                    size="small"
                                                />
                                            </FormControl>
                                        </Grid>
                                        <Grid item xs={2}>
                                            <FormControl variant="outlined" margin="dense" fullWidth>
                                                <TextField
                                                    label="更新间隔"
                                                    value={galore_update_interval}
                                                    helperText="相邻两次投影更新的步数"
                                                    onChange={(e) => setGalore_update_interval(e.target.value)}
                                                    size="small"
                                                />
                                            </FormControl>
                                        </Grid>
                                        <Grid item xs={3}>
                                            <FormControl variant="outlined" margin="dense" fullWidth>
                                                <TextField
                                                    label="GaLore 缩放系数"
                                                    value={galore_scale}
                                                    helperText="GaLore 缩放系数大小"
                                                    onChange={(e) => setGalore_scale(e.target.value)}
                                                    size="small"
                                                />
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
                                                <TextField
                                                    label="切换频率"
                                                    value={badam_switch_interval}
                                                    helperText="Layer-wise BAdam 优化器的块切换频率"
                                                    onChange={(e) => setBadam_switch_interval(e.target.value)}
                                                    size="small"
                                                />
                                            </FormControl>
                                        </Grid>
                                        <Grid item xs={3}>
                                            <FormControl variant="outlined" margin="dense" fullWidth>
                                                <TextField
                                                    label="Block 更新比例"
                                                    value={badam_update_ratio}
                                                    helperText="Ratio-wise BAdam 优化器的更新比例"
                                                    onChange={(e) => setBadam_update_ratio(e.target.value)}
                                                    size="small"
                                                />
                                            </FormControl>
                                        </Grid>
                                    </Grid>
                                </AccordionDetails>
                            </Accordion>
                        </Paper>

                        <Paper elevation={4} style={{padding: "20px", marginTop:"10px"}}>
                            <Grid container spacing={1}>
                                <Grid item xs={4}>
                                    <FormControl variant="outlined" margin="dense" fullWidth>
                                        <TextField
                                            label="输出目录"
                                            value={output_dir}
                                            helperText="保存结果的路径"
                                            onChange={(e) => setOutput_dir(e.target.value)}
                                            size="small"
                                        />
                                    </FormControl>
                                </Grid>
                                <Grid item xs={8}>
                                    <FormControl variant="outlined" margin="dense" fullWidth>
                                         <div style={{display: 'flex'}}>
                                        <TextField
                                            label="配置路径"
                                            value={config_path}
                                            style={{flexGrow:1}}
                                            helperText=""
                                            onChange={(e) => setConfig_path(e.target.value)}
                                            size="small"
                                        />
                                             <Button
                                                variant="contained"
                                                size="small"
                                                endIcon={<VisibilitySharpIcon/>}
                                                className="addBtn"
                                                onClick={handleViewDataset}
                                            >
                                                保存训练参数
                                            </Button>
                                            <Button
                                                variant="contained"
                                                size="small"
                                                endIcon={<VisibilitySharpIcon/>}
                                                className="addBtn"
                                                onClick={handleViewDataset}
                                            >
                                                载入训练参数
                                            </Button>
                                            <Button
                                                variant="contained"
                                                size="small"
                                                endIcon={<RocketLaunchIcon/>}
                                                className="addBtn"
                                                onClick={handleTrainModel}
                                            >
                                                开始
                                            </Button>
                                            <Button
                                                enabled={isEnable}
                                                variant="contained"
                                                size="small"
                                                endIcon={<CancelIcon/>}
                                                className="addBtn"
                                                onClick={handleStopTrain}
                                            >
                                                中断
                                            </Button>
                                        </div>
                                    </FormControl>
                                </Grid>
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
        </Box>
    )
}

export default TrainDetail
