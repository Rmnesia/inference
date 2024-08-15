import {
    Box,
    Grid, List, ListItem, ListItemIcon, ListItemText,
    Paper
} from '@mui/material'
import React, {useContext, useEffect, useRef, useState} from 'react'
import {useCookies} from 'react-cookie'
import {useNavigate, useParams, useSearchParams} from 'react-router-dom'
import {ApiContext} from '../../components/apiContext'
import ErrorMessageSnackBar from '../../components/errorMessageSnackBar'
import fetcher from '../../components/fetcher'
import Title from '../../components/Title'
import {LineChart} from '@mui/x-charts/LineChart';
import Typography from "@mui/material/Typography";
import SuccessMessageSnackBar from "../../components/successMessageSnackBar";
import FileDownloadDoneIcon from "@mui/icons-material/FileDownloadDone";

const TrainResult = () => {
    const {name} = useParams();
    let [searchParams] = useSearchParams();
    let path = searchParams.get("path");
    let endPoint = useContext(ApiContext).endPoint
    const {isCallingApi, setIsCallingApi} = useContext(ApiContext)
    const {setErrorMsg} = useContext(ApiContext)
    const [cookie] = useCookies(['token'])
    const navigate = useNavigate()
    //图表元数据
    const [graphs, setGraphs] = useState([])
    //图表X轴数据
    const [xAxis, setXAxis] = useState([])
    //图标Y轴数据
    const [yAxis, setYAxis] = useState([])
    //原始数据
    const [returnContent, setReturnContent] = useState([])
    const listRef = useRef(null); // 创建一个ref来引用<ul>
    const update = (isCallingApi) => {
        if (cookie.token === '' || cookie.token === undefined) {
            return
        }
        if (cookie.token !== 'no_auth' && !sessionStorage.getItem('token')) {
            navigate('/login', {replace: true})
            return
        }
        if (isCallingApi) {
            console.log('加载中，请勿刷新页面');
        } else {
            setXAxis([])
            setYAxis([])
            try {
                setIsCallingApi(true)
                fetcher(`${endPoint}/logs/get_logs?name=${name}/${path}`, {
                    method: 'GET'
                }).then((response) => {
                    console.log(response);
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
                        response.json().then((data) => {
                            console.log(data)
                            if (data.trainer_log && data.trainer_log.length > 0) {
                                data.trainer_log.forEach((cur, index) => {
                                    if (index != data.trainer_log.length - 1) {
                                        setGraphs(preItems => [...preItems, cur])
                                        setReturnContent(preItems => [...preItems, JSON.stringify(cur)]);
                                    }
                                })
                                for (let key in data.all_results) {
                                    setReturnContent(preItems => [...preItems, key + ":" + data.all_results[key]])
                                }
                            }
                        })
                    }
                })
            } catch (error) {
                console.error('Error:', error)
            } finally {
                setIsCallingApi(false)
            }
        }
    }

    useEffect(() => {
        update(isCallingApi)
    }, [isCallingApi, cookie.token])

    const goBack = () => {
        navigate('/train_model/train_result')
    }
    //监听解析训练结果实时图表显示
    useEffect(() => {
        const xAxisArr = graphs.map(item => item.epoch)
        setXAxis(xAxisArr)
        const yAxisArr = graphs.map(item => item.loss)
        setYAxis(yAxisArr)
    }, [graphs])

    // 使用useEffect来监听数据源的变化,将滚动条置于页面底部
    useEffect(() => {
        if (listRef.current) {
            listRef.current.scrollTop = listRef.current.scrollHeight;
        }
    }, [returnContent]); // 只有当items改变时才运行此effect

    return (
        <Box m="20px">
            <div style={{display: 'flex'}}>
                <div style={{cursor: 'pointer'}} onClick={goBack}><Title title={'模型训练 / 训练结果 '}/></div>
                <Title title={' ' + name + '/' + path} color="text.primary"/>
            </div>
            <ErrorMessageSnackBar/>
            <SuccessMessageSnackBar/>
            <Box
                sx={{
                    height: '100%',
                    width: '100%',
                    paddingLeft: '100px',
                    paddingRight: '100px',
                    paddingTop: '20px',
                }}
            >
                <Paper elevation={2} style={{padding: "20px", marginTop: "10px"}}>
                    <Grid container spacing={1}>
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
                                    height={480}
                                />
                            </Paper>
                        </Grid>

                        <Grid item xs={6}>
                            <Paper elevation={3} style={{padding: '18px'}}>
                                <Typography sx={{mt: 4, mb: 2}} style={{marginTop: '0px'}} variant="h3"
                                            component="div">结果明细</Typography>
                                <List ref={listRef} dense={false}
                                      style={{height: "480px", overflow: "auto"}}>
                                    {
                                        returnContent.map((item) => {
                                            return (
                                                <ListItem>
                                                    <ListItemIcon>
                                                        <FileDownloadDoneIcon/>
                                                    </ListItemIcon>
                                                    <ListItemText style={{wordBreak:'break-word'}}
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
    )
}

export default TrainResult
