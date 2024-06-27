import {
    Box,
    Button,
    // ButtonGroup,
    // ClickAwayListener,
    // Drawer,
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
    FormControlLabel,
    Dialog,
    DialogTitle,
    //  DialogContentText,
    DialogContent,
    List, ListItemButton, Divider,  DialogActions, DialogContentText
} from '@mui/material'
import React, {useContext, useEffect, useState} from 'react'
import {useCookies} from 'react-cookie'
import {useNavigate, useParams} from 'react-router-dom'
import VisibilitySharpIcon from '@mui/icons-material/VisibilitySharp';
import CancelIcon from '@mui/icons-material/Cancel';
import RocketLaunchIcon from '@mui/icons-material/RocketLaunch';
import {ApiContext} from '../../components/apiContext'
import ErrorMessageSnackBar from '../../components/errorMessageSnackBar'
import fetcher from '../../components/fetcher'
import Title from '../../components/Title'
// import styles from "./styles/modelCardStyle";
// import {RocketLaunchOutlined, UndoOutlined} from "@mui/icons-material";
import Checkbox from '@mui/material/Checkbox';
// import Paper from "@mui/material/Paper";


const TestDetail = () => {
    const {id} = useParams();
    const name = id;
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
    //数据路径
    const [dataset_dir, setDataset_dir] = useState('data');
    //数据集集合
    const [datasetList, setDatasetList] = useState([]);
    //数据集
    const [dataset, setDataset] = useState([])
    //数据集明细
    const [datasetDetails, setDatasetDetails] = useState([{question: '尼米兹航母作战能力？', answer: '相当不错'}])
    //模型名称
    // const [modelName, setModelName] = useState(name);
    //截断长度
    const [cutoff_len, setCutoff_len] = useState(1024);
    //最大样本数
    const [max_samples, setMax_samples] = useState(100000);
    //批处理大小
    const [batch_size, setBatch_size] = useState(2);
    //保存预测结果
    const [predict, setPredict] = useState(true);
    //最大生成长度
    const [max_new_tokens, setMax_new_tokens] = useState(512);
    //Top-p采样值
    const [top_p, setTop_p] = useState(0.7);
    //温度系数
    const [temperature, setTemperature] = useState(0.95);
    //输出目录
    const [output_dir, setOutput_dir] = useState('');
    //新增数据是否显示抽屉
    const [isShow, setIsShow] = useState(false)
    const [isEnable, setIsEnable] = useState(false);
    // const Transition = React.forwardRef(function Transition(props, ref) {
    //     return <Slide direction="up" ref={ref} {...props} />;
    // });
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
    const handleCheckBoxChange = (e) => {
        setPredict(e.target.checked)
    }
    //关闭数据集预览
    const handleClose = () => {
        setIsShow(false)
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
        navigate('/test_model/llm')
    }

    const descriptionElementRef = React.useRef(null);
  useEffect(() => {
    if (isShow) {
      const { current: descriptionElement } = descriptionElementRef;
      if (descriptionElement !== null) {
        descriptionElement.focus();
      }
    }
  }, [isShow]);

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
                    <Grid container spacing={1}>
                        <Grid item xs={4}>
                            <FormControl variant="outlined" margin="normal" fullWidth>
                                <TextField
                                    label="数据路径"
                                    value={dataset_dir}
                                    helperText="数据文件夹的路径"
                                    onChange={(e) => setDataset_dir(e.target.value)}
                                    size="small"
                                />
                            </FormControl>
                        </Grid>
                        <Grid item xs={8}>
                            <FormControl variant="outlined" margin="normal" fullWidth>
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
                                            setDatasetDetails([{question: '尼米兹航母作战能力？', answer: '相当不错'}])
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
                                </div>
                            </FormControl>
                        </Grid>
                        <Grid item xs={4}>
                            <FormControl variant="outlined" margin="normal" fullWidth>
                                <TextField
                                    label="截断长度"
                                    value={cutoff_len}
                                    helperText="输入序列分词后的最大长度"
                                    onChange={(e) => setCutoff_len(e.target.value)}
                                    size="small"
                                />
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
                            <FormControl variant="outlined" margin="normal" fullWidth>
                                <TextField
                                    label="批处理大小"
                                    value={batch_size}
                                    helperText="每个 GPU 处理的样本数量"
                                    onChange={(e) => setBatch_size(e.target.value)}
                                    size="small"
                                />
                            </FormControl>
                        </Grid>
                        <Grid item xs={4}>
                            <FormControl variant="outlined" margin="normal" fullWidth>
                                <TextField
                                    label="最大生成长度"
                                    value={max_new_tokens}
                                    helperText=""
                                    onChange={(e) => setMax_new_tokens(e.target.value)}
                                    size="small"
                                />
                            </FormControl>
                        </Grid>
                        <Grid item xs={4}>
                            <FormControl variant="outlined" margin="normal" fullWidth>
                                <TextField
                                    label="Top-p 采样值"
                                    value={top_p}
                                    helperText=""
                                    onChange={(e) => setTop_p(e.target.value)}
                                    size="small"
                                />
                            </FormControl>
                        </Grid>
                        <Grid item xs={4}>
                            <FormControl variant="outlined" margin="normal" fullWidth>
                                <TextField
                                    label="温度系数"
                                    value={temperature}
                                    helperText=""
                                    onChange={(e) => setTemperature(e.target.value)}
                                    size="small"
                                />
                            </FormControl>
                        </Grid>
                        <Grid item xs={4}>
                            <FormControl variant="outlined" margin="normal" fullWidth>
                                <TextField
                                    label="输出目录"
                                    value={output_dir}
                                    helperText="保存结果的路径"
                                    onChange={(e) => setOutput_dir(e.target.value)}
                                    size="small"
                                />
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
                                    <Button
                                        variant="contained"
                                        size="small"
                                        endIcon={<RocketLaunchIcon/>}
                                        className="addBtn"
                                        onClick={handleTrainModel}
                                    >
                                        开始测试
                                    </Button>
                                    <Button
                                        enabled={isEnable}
                                        variant="contained"
                                        size="small"
                                        endIcon={<CancelIcon/>}
                                        className="addBtn"
                                        onClick={handleStopTrain}
                                    >
                                        中止测试
                                    </Button>
                                </div>
                            </FormControl>
                        </Grid>
                    </Grid>
                </Box>
            </Box>

<React.Fragment>
            <Dialog
                open={isShow}
               // fullWidth={true}
               // maxWidth={"md"}
                scroll={"paper"}
               // TransitionComponent={Transition}
                onClose={handleClose}
                aria-labelledby="scroll-dialog-title"
                aria-describedby="scroll-dialog-description"
            >
                <DialogTitle style={{fontSize:"1.25rem"}} id="scroll-dialog-title">{"数据集预览"}</DialogTitle>
                <DialogContent dividers={true}>
                    <DialogContentText
            id="scroll-dialog-description"
            ref={descriptionElementRef}
            tabIndex={-1}
          >
                    <List>
                        {datasetDetails.map((item) => {
                            return (
                                <>
                                    <ListItemButton>
                                        <ListItemText primary={item.question} secondary={item.answer}/>
                                    </ListItemButton>
                                    <Divider/>
                                </>
                            )
                        })}
                    </List>
                    </DialogContentText>
                </DialogContent>
                <DialogActions>
                    <Button onClick={handleClose}>关闭</Button>
                </DialogActions>
            </Dialog>
</React.Fragment>
        </Box>
    )
}

export default TestDetail
