import {
    Box,
    Button,
    ButtonGroup,
    ClickAwayListener,
    Drawer,
    FormControl,
    Grid,
    Grow, InputLabel, MenuItem, MenuList,
    Popper, Select,
    //Stack,
    tableCellClasses, TableContainer, TablePagination,
    TextField
} from '@mui/material'
import React, {useContext, useEffect, useRef, useState} from 'react'
import {useCookies} from 'react-cookie'
import {useNavigate, useParams} from 'react-router-dom'
import DeleteOutlineOutlinedIcon from '@mui/icons-material/DeleteOutlineOutlined'
import ArrowDropDownIcon from '@mui/icons-material/ArrowDropDown';
import BorderColorIcon from '@mui/icons-material/BorderColor';
// import {DataGrid} from '@mui/x-data-grid'
import {ApiContext} from '../../components/apiContext'
import ErrorMessageSnackBar from '../../components/errorMessageSnackBar'
import fetcher from '../../components/fetcher'
import Title from '../../components/Title'
import HotkeyFocusTextField from "../../components/hotkeyFocusTextField";
import styles from "./styles/modelCardStyle";
import {RocketLaunchOutlined, UndoOutlined} from "@mui/icons-material";
import Paper from "@mui/material/Paper";
import SuccessMessageSnackBar from "../../components/successMessageSnackBar";
import {styled} from "@mui/system";
import TableCell from "@mui/material/TableCell";
import TableRow from "@mui/material/TableRow";
import Table from "@mui/material/Table";
import TableHead from "@mui/material/TableHead";
import TableBody from "@mui/material/TableBody";

const DatasetDetail = () => {
    const {id, type} = useParams();
    const name = id;
    const datasetType = type;
    let endPoint = useContext(ApiContext).endPoint
    const parentRef = useRef(null)
    const [detailData, setDetailData] = useState([])
    const [page_num, setPage_num] = useState(1)
    const [page_size, setPage_size] = useState(100)
    const [rowCount, setRowCount] = useState(0)
    const {isCallingApi, setIsCallingApi} = useContext(ApiContext)
    const {isUpdatingModel, setIsUpdatingModel} = useContext(ApiContext)
    const {setErrorMsg} = useContext(ApiContext)
    const {setSuccessMsg} = useContext(ApiContext)
    const [cookie] = useCookies(['token'])
    const navigate = useNavigate()
    const [searchTerm, setSearchTerm] = useState('')
    //新增数据是否显示抽屉
    const [isShow, setIsShow] = useState(false)
    //修改数据是否显示抽屉
    const [isEditShow, setIsEditShow] = useState(false);
    //问题
    const [instruction, setInstruction] = useState('')
    //额外要求
    const [input, setInput] = useState('')
    //输出
    const [output, setOutput] = useState('')
    //系统Prompt
    const [system, setSystem] = useState('')
    //文本
    const [text, setText] = useState('')
    //文件类型
    const [fileType, setFileType] = useState('excel')
    //文件类型项
    const fileTypeOptions = [{name: 'Excel', value: 'excel'}, {name: 'Json', value: 'json'}]
    //文件模版
    const fileTemplates = {"qa": "QA问答模板", "text": "语料模板"};
    //文件
    const [upload_file, setUpload_file] = useState(null);
    // Split button
    const options = ['添加数据', '批量导入'];
    const [open, setOpen] = useState(false);
    const anchorRef = useRef(null)
    const [selectedIndex, setSelectedIndex] = useState(0);

    const StyledTableCell = styled(TableCell)(({theme}) => ({
        [`&.${tableCellClasses.head}`]: {
            backgroundColor: theme.palette.action.hover,//common.black,
            fontWeight: 'bold',
            fontSize: 14,

        },
        [`&.${tableCellClasses.body}`]: {
            fontSize: 14,
        },
    }));

    const StyledTableRow = styled(TableRow)(({theme}) => ({
        '&:nth-of-type(even)': {
            backgroundColor: theme.palette.action.hover,
        },
        // hide last border
        '&:last-child td, &:last-child th': {
            border: 0,
        },
    }));

    //直接点击添加按钮
    const handleClick = () => {
        setIsShow(true)
    }
    //选择下拉菜单项
    const handleMenuItemClick = (
        event,
        index
    ) => {
        setSelectedIndex(index);
        setOpen(false);
        setIsShow(true)
    }
    //打开按钮下来菜单
    const handleToggle = (e) => {
        setOpen((prevOpen) => !prevOpen);
        e.preventDefault();
    }
    //关闭下拉菜单
    const handleClose = () => {
        setOpen(false);
    }
    //用户输入关键词检索
    const handleChange = (event) => {
        setSearchTerm(event.target.value)
        update()
    }
    //   const [paginationModel, setPaginationModel] = React.useState({
    //   page: 0,
    //   pageSize: 100,
    // });


    //获取数据集数据
    const update = (isCallingApi) => {
        if (cookie.token === '' || cookie.token === undefined) {
            return
        }
        if (cookie.token !== 'no_auth' && !sessionStorage.getItem('token')) {
            navigate('/login', {replace: true})
            return
        }
        if (isCallingApi) {
            setDetailData([{id: 'Loading, do not refresh page...', url: 'IS_LOADING'}])
        } else {
            try {
                setIsUpdatingModel(true)
                fetcher(`${endPoint}/v1/dataset/read_data`, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify(
                        {
                            "dataset_name": name,
                            "keyword": searchTerm,
                            "page_num": page_num,
                            "page_size": page_size
                        })
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
                                response.data_list.forEach(obj => {
                                    obj.id = `id-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
                                    if (!Object.prototype.hasOwnProperty.call(obj, 'system')) {
                                        obj.system = '';
                                    }
                                });
                                setDetailData(response.data_list)
                                setRowCount(response.total)
                                setIsUpdatingModel(false)
                            })
                        }
                    })
            } catch (error) {
                console.error('Error:', error)
            } finally {
                setIsUpdatingModel(false)
            }
        }
    }
    const handlePageChange = (e, newPage) => {
        setPage_num(newPage);
    };

    const handlePageSizeChange = (e) => {
        setPage_size(e.target.value);
        setPage_num(0)
    };
    //单条添加数据集数据
    const addDatasetData = (isCallingApi) => {
        if (
            isCallingApi ||
            isUpdatingModel ||
            (cookie.token !== 'no_auth' && !sessionStorage.getItem('token'))
        )
            return

        try {
            if (isShow) {
                setIsCallingApi(true)
                fetcher(`${endPoint}/v1/dataset/add_data`, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify(
                        {
                            "dataset_name": name,
                            "data_list": [
                                (datasetType == "qa" ? {
                                    "instruction": instruction,
                                    "input": input,
                                    "output": output,
                                    "system": system
                                } : {"text": text})]
                        })
                }).then((response) => {
                    setIsShow(false);
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
                        setSuccessMsg("添加成功")
                        setIsShow(false);
                        update()
                    }
                })
            }
            if (isEditShow) {
                console.log('update.....')
            }
        } catch (error) {
            console.error('Error:', error)
        } finally {
            setIsCallingApi(false)
        }
    }
    //批量导入数据集数据
    const uploadDatasetData = (isCallingApi) => {
        if (
            isCallingApi ||
            isUpdatingModel ||
            (cookie.token !== 'no_auth' && !sessionStorage.getItem('token'))
        )
            return
        try {
            setIsCallingApi(true)
            const formData = new FormData();
            formData.append('upload_file', upload_file);
            formData.append('dataset_name', name);
            fetcher(`${endPoint}/v1/dataset/upload_data`, {
                method: 'POST',
                body: formData
            }).then((response) => {
                setIsShow(false);
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
                    setSuccessMsg('批量导入成功')
                    setIsShow(false);
                    update()
                }
            })
        } catch (error) {
            console.error('Error:', error)
        } finally {
            setIsCallingApi(false)
        }
    }
    //下载模版
    const downloadTemplate = () => {
        try {
            setIsCallingApi(true)
            const url = `${endPoint}/v1/dataset/download_template/${fileType}/${fileTemplates[datasetType] + (fileType == "excel" ? ".xlsx" : ".json")}`;
            fetcher(url, {
                method: 'GET',
            }).then((response) => {
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
                    window.open(url);
                    setSuccessMsg('下载成功')
                }
            })
        } catch (error) {
            console.error('Error:', error)
        } finally {
            setIsCallingApi(false)
        }
    }


    // useEffect(() => {
    //
    //     // eslint-disable-next-line
    // }, [isCallingApi, cookie.token])

    useEffect(() => {
        update(isCallingApi)
    }, [isCallingApi, page_num, page_size, cookie.token])
    // const detailColumns = [
    //     ...(datasetType === "qa" ? (name.indexOf('rlhf') >= 0 ? [
    //             {
    //                 field: 'question',
    //                 headerName: '问题',
    //                 flex: 1,
    //             },
    //             {
    //                 field: 'answer',
    //                 headerName: '输出',
    //                 flex: 1,
    //                 renderCell: ({row}) => {
    //                     return (
    //                         <Box>
    //                             {row.answer.map((cur) => {
    //                                 return (<div title={cur}>{cur}</div>)
    //                             })
    //                             }
    //                         </Box>
    //                     )
    //                 }
    //             },
    //             {
    //                 field: 'system',
    //                 headerName: '系统Prompt',
    //                 flex: 1,
    //             }
    //         ] : [
    //             {
    //                 field: 'instruction',
    //                 headerName: '问题',
    //                 flex: 1,
    //             },
    //             {
    //                 field: 'input',
    //                 headerName: '额外要求',
    //                 flex: 1,
    //             },
    //             {
    //                 field: 'output',
    //                 headerName: '输出',
    //                 flex: 1,
    //             },
    //             {
    //                 field: 'system',
    //                 headerName: '系统Prompt',
    //                 minWidth: 100,
    //             }]) : [{
    //             field: 'text',
    //             headerName: '文本',
    //             flex: 1,
    //         }]
    //     ),
    //     {
    //         field: 'url',
    //         headerName: '操作',
    //         minWidth: 100,
    //         sortable: false,
    //         filterable: false,
    //         disableColumnMenu: true,
    //         renderCell: ({row}) => {
    //             const url = row.url
    //             // const openUrl = `${endPoint}/` + url
    //             //    const closeUrl = `${endPoint}/v1/models/` + url
    //             //    const gradioUrl = `${endPoint}/v1/ui/` + url
    //
    //             if (url === 'IS_LOADING') {
    //                 return <div></div>
    //             }
    //
    //             return (
    //                 <Box
    //                     style={{
    //                         width: '100%',
    //                         display: 'flex',
    //                         justifyContent: 'left',
    //                         alignItems: 'left',
    //                     }}
    //                 >
    //                     <button
    //                         title="编辑"
    //                         style={{
    //                             borderWidth: '0px',
    //                             backgroundColor: 'transparent',
    //                             paddingLeft: '0px',
    //                             paddingRight: '10px',
    //                         }}
    //                         onClick={() => {
    //                             setIsEditShow(true);
    //                             if (datasetType === "qa") {
    //                                 setInstruction(row.instruction)
    //                                 setInput(row.input)
    //                                 setOutput(row.output)
    //                                 setSystem(row.system)
    //                             } else if (datasetType === "text") {
    //                                 setText(row.text)
    //                             }
    //                         }}
    //                     >
    //                         <Box
    //                             width="40px"
    //                             m="0 auto"
    //                             p="5px"
    //                             display="flex"
    //                             justifyContent="center"
    //                             borderRadius="4px"
    //                             style={{
    //                                 border: '1px solid #e5e7eb',
    //                                 borderWidth: '1px',
    //                                 borderColor: '#e5e7eb',
    //                             }}
    //                         >
    //                             <BorderColorIcon/>
    //                             {/*<OpenInBrowserOutlinedIcon/>*/}
    //                         </Box>
    //                     </button>
    //                     <button
    //                         title="删除"
    //                         style={{
    //                             borderWidth: '0px',
    //                             backgroundColor: 'transparent',
    //                             paddingLeft: '0px',
    //                             paddingRight: '10px',
    //                         }}
    //                         onClick={() => {
    //                             if (isCallingApi || isUpdatingModel) {
    //                                 return
    //                             }
    //                             setIsCallingApi(true)
    //                             const closeUrl = ''
    //                             fetcher(closeUrl, {
    //                                 method: 'DELETE',
    //                             })
    //                                 .then((response) => {
    //                                     response.json()
    //                                 })
    //                                 .then(() => {
    //                                     setIsCallingApi(false)
    //                                 })
    //                                 .catch((error) => {
    //                                     console.error('Error:', error)
    //                                     setIsCallingApi(false)
    //                                 })
    //                         }}
    //                     >
    //                         <Box
    //                             width="40px"
    //                             m="0 auto"
    //                             p="5px"
    //                             display="flex"
    //                             justifyContent="center"
    //                             borderRadius="4px"
    //                             style={{
    //                                 border: '1px solid #e5e7eb',
    //                                 borderWidth: '1px',
    //                                 borderColor: '#e5e7eb',
    //                             }}
    //                         >
    //                             <DeleteOutlineOutlinedIcon/>
    //                         </Box>
    //                     </button>
    //                 </Box>
    //             )
    //         },
    //     },
    // ]
    // console.log(detailColumns)
    // const dataGridStyle = {
    //     'display': 'none',
    //     '& .MuiDataGrid-cell': {
    //         borderBottom: 'none',
    //         fontSize: '14px',
    //     },
    //     '& .MuiDataGrid-columnHeaders': {
    //         borderBottom: 'none',
    //         backgroundColor: '#EFEFEF',
    //         fontSize: '14px',
    //     },
    //     '& .MuiDataGrid-columnHeaderTitle': {
    //         fontWeight: 'bold',
    //     },
    //     '& .MuiDataGrid-virtualScroller': {
    //         overflowX: 'visible !important',
    //         overflow: 'visible',
    //     },
    //     '& .MuiDataGrid-footerContainer': {
    //         borderTop: 'none',
    //     },
    //     // 'border-width': '0px',
    //     '& .MuiDataGrid-row': {
    //         '&:nth-of-type(even)': {
    //             backgroundColor: '#F5F5F5',
    //         },
    //     },
    // }
    // console.log(dataGridStyle)
    // const noRowsOverlay = () => {
    //     return (
    //         <Stack height="100%" alignItems="center" justifyContent="center">
    //             暂无符合条件的数据
    //         </Stack>
    //     )
    // }
    //
    // const noResultsOverlay = () => {
    //     return (
    //         <Stack height="100%" alignItems="center" justifyContent="center">
    //             暂无符合条件的数据
    //         </Stack>
    //     )
    // }

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
        navigate('/dataset')
    }
    useEffect(() => {
    })

    return (
        <Box m="20px">
            <div style={{display: 'flex'}}>
                <div style={{cursor: 'pointer'}} onClick={goBack}><Title title={'数据集管理 / '}/></div>
                <Title title={' ' + name} color="text.primary"/>
            </div>
            <SuccessMessageSnackBar/>
            <ErrorMessageSnackBar/>
            <div
                style={{
                    display: 'grid',
                    gridTemplateColumns: '100% 1fr',
                    columnGap: '20px',
                    margin: '0px 2rem 30px 2rem',
                }}
            >
                <FormControl variant="outlined" margin="normal">
                    <div style={{display: 'flex'}}>
                        <HotkeyFocusTextField
                            id="search"
                            type="search"
                            label="根据问题或输入进行检索"
                            value={searchTerm}
                            onChange={handleChange}
                            style={{flexGrow: 1}}
                            size="small"
                            hotkey="/"
                        />
                        <React.Fragment>
                            <ButtonGroup
                                variant="contained"
                                ref={anchorRef}
                                aria-label="Button group with a nested menu"
                            >
                                <Button onClick={handleClick}>{options[selectedIndex]}</Button>
                                <Button
                                    size="small"
                                    aria-controls={open ? 'split-button-menu' : undefined}
                                    aria-expanded={open ? 'true' : undefined}
                                    aria-label="select merge strategy"
                                    aria-haspopup="menu"
                                    onClick={handleToggle}
                                >
                                    <ArrowDropDownIcon/>
                                </Button>
                            </ButtonGroup>
                            <Popper
                                sx={{
                                    zIndex: 3,
                                }}
                                open={open}
                                anchorEl={anchorRef.current}
                                role={undefined}
                                transition
                                disablePortal
                            >
                                {({TransitionProps, placement}) => (
                                    <Grow
                                        {...TransitionProps}
                                        style={{
                                            transformOrigin:
                                                placement === 'bottom' ? 'center top' : 'center bottom',
                                        }}
                                    >
                                        <Paper>
                                            <ClickAwayListener onClickAway={handleClose}>
                                                <MenuList id="split-button-menu" autoFocusItem>
                                                    {options.map((option, index) => (
                                                        <MenuItem
                                                            key={option}
                                                            disabled={index === 2}
                                                            selected={index === selectedIndex}
                                                            onClick={(event) => handleMenuItemClick(event, index)}
                                                        >
                                                            {option}
                                                        </MenuItem>
                                                    ))}
                                                </MenuList>
                                            </ClickAwayListener>
                                        </Paper>
                                    </Grow>
                                )}
                            </Popper>
                        </React.Fragment>
                    </div>
                </FormControl>
            </div>
            <TableContainer component={Paper} sx={{maxHeight: 'calc(100vh - 250px)'}}>
                <Table sx={{}} stickyHeader aria-label="customized table">
                    <TableHead>
                        <TableRow>
                            <StyledTableCell align="center">问题</StyledTableCell>
                            <StyledTableCell align="center">额外要求</StyledTableCell>
                            <StyledTableCell align="center">输出</StyledTableCell>
                            <StyledTableCell align="center">系统Prompt</StyledTableCell>
                            <StyledTableCell align="center">操作</StyledTableCell>
                        </TableRow>
                    </TableHead>
                    <TableBody>
                        {detailData.map((row) => (
                            <StyledTableRow key={row.id}>
                                <StyledTableCell
                                    align="center">{(datasetType == 'qa' ? (name.indexOf('rlhf') >= 0 ? row.question : row.instruction) : row.text)}</StyledTableCell>
                                <StyledTableCell
                                    align="center">{(datasetType == 'qa' ? (name.indexOf('rlhf') >= 0 ? '' : row.input) : '')}</StyledTableCell>
                                <StyledTableCell
                                    align="center">{(datasetType == 'qa' ? (name.indexOf('rlhf') >= 0 ? row.answer.join('\r\n') : row.output) : '')}</StyledTableCell>
                                <StyledTableCell
                                    align="center">{(datasetType == 'qa' ? row.system : '')}</StyledTableCell>
                                <StyledTableCell align="center"><Box
                                    style={{
                                        width: '100%',
                                        display: 'flex',
                                        justifyContent: 'left',
                                        alignItems: 'left',
                                    }}
                                >
                                    <button
                                        title="编辑"
                                        style={{
                                            borderWidth: '0px',
                                            backgroundColor: 'transparent',
                                            paddingLeft: '0px',
                                            paddingRight: '10px',
                                        }}
                                        onClick={() => {
                                            setIsEditShow(true);
                                            if (datasetType === "qa") {
                                                setInstruction(row.instruction)
                                                setInput(row.input)
                                                setOutput(row.output)
                                                setSystem(row.system)
                                            } else if (datasetType === "text") {
                                                setText(row.text)
                                            }
                                        }}
                                    >
                                        <Box
                                            width="40px"
                                            m="0 auto"
                                            p="5px"
                                            display="flex"
                                            justifyContent="center"
                                            borderRadius="4px"
                                            style={{
                                                border: '1px solid #e5e7eb',
                                                borderWidth: '1px',
                                                borderColor: '#e5e7eb',
                                            }}
                                        >
                                            <BorderColorIcon/>
                                            {/*<OpenInBrowserOutlinedIcon/>*/}
                                        </Box>
                                    </button>
                                    <button
                                        title="删除"
                                        style={{
                                            borderWidth: '0px',
                                            backgroundColor: 'transparent',
                                            paddingLeft: '0px',
                                            paddingRight: '10px',
                                        }}
                                        onClick={() => {
                                            if (isCallingApi || isUpdatingModel) {
                                                return
                                            }
                                            setIsCallingApi(true)
                                            const closeUrl = ''
                                            fetcher(closeUrl, {
                                                method: 'DELETE',
                                            })
                                                .then((response) => {
                                                    response.json()
                                                })
                                                .then(() => {
                                                    setIsCallingApi(false)
                                                })
                                                .catch((error) => {
                                                    console.error('Error:', error)
                                                    setIsCallingApi(false)
                                                })
                                        }}
                                    >
                                        <Box
                                            width="40px"
                                            m="0 auto"
                                            p="5px"
                                            display="flex"
                                            justifyContent="center"
                                            borderRadius="4px"
                                            style={{
                                                border: '1px solid #e5e7eb',
                                                borderWidth: '1px',
                                                borderColor: '#e5e7eb',
                                            }}
                                        >
                                            <DeleteOutlineOutlinedIcon/>
                                        </Box>
                                    </button>
                                </Box></StyledTableCell>
                            </StyledTableRow>
                        ))}
                    </TableBody>
                </Table>
            </TableContainer>

            {/*<DataGrid*/}
            {/*    rows={detailData}*/}
            {/*    columns={detailColumns}*/}
            {/*    pagination={false} // 这将隐藏分页功能*/}
            {/*    //  rowCount={rowCount}*/}
            {/*    //   getRowId={(row) => row.instruction + new Date().getTime()}*/}
            {/*    autoHeight={true}*/}
            {/*    sx={dataGridStyle}*/}
            {/*    // paginationModel={paginationModel}*/}
            {/*    // paginationMode="server"*/}
            {/*    //  onPaginationModelChange={setPaginationModel}*/}
            {/*    // onPageChange={handlePageChange}*/}
            {/*    //  onPageSizeChange={handlePageSizeChange}*/}
            {/*    // onPageChange={(newPage) => {*/}
            {/*    //     setPage_num(newPage)*/}
            {/*    //     update(isCallingApi)*/}
            {/*    // }}*/}
            {/*    // onPageSizeChange={(newPageSize) => {*/}
            {/*    //     setPage_size(newPageSize)*/}
            {/*    //     update(isCallingApi)*/}
            {/*    // }}*/}
            {/*    slots={{*/}
            {/*        noRowsOverlay: noRowsOverlay,*/}
            {/*        noResultsOverlay: noResultsOverlay,*/}
            {/*    }}*/}
            {/*/>*/}

            <TablePagination
                component="div"
                count={rowCount}
                page={page_num}
                onPageChange={handlePageChange}
                rowsPerPage={page_size}
                onRowsPerPageChange={handlePageSizeChange}
            />

            <Drawer
                open={isShow || isEditShow}
                onClose={() => {
                    setIsShow(false)
                }}
                anchor={'right'}
            >
                {selectedIndex == 0 &&
                    <div style={styles.drawerCard}>
                        <Box
                            ref={parentRef}
                            style={styles.formContainer}
                            display="flex"
                            flexDirection="column"
                            width="100%"
                            mx="auto"
                        >
                            {datasetType === "qa" && <Grid rowSpacing={0} columnSpacing={1}>
                                <Grid item xs={12}>
                                    <FormControl variant="outlined" margin="normal" fullWidth>
                                        <TextField
                                            multiline
                                            rows={4}
                                            label="问题"
                                            value={instruction}
                                            onChange={(e) => setInstruction(e.target.value)}
                                        />
                                    </FormControl>
                                </Grid>
                                <Grid item xs={12}>
                                    <FormControl variant="outlined" margin="normal" fullWidth>
                                        <TextField
                                            multiline
                                            rows={4}
                                            label="额外要求"
                                            value={input}
                                            onChange={(e) => setInput(e.target.value)}
                                        />
                                    </FormControl>
                                </Grid>
                                <Grid item xs={12}>
                                    <FormControl variant="outlined" margin="normal" fullWidth>
                                        <TextField
                                            multiline
                                            rows={4}
                                            label="输出"
                                            value={output}
                                            onChange={(e) => setOutput(e.target.value)}
                                        />
                                    </FormControl>
                                </Grid>
                                <Grid item xs={12}>
                                    <FormControl variant="outlined" margin="normal" fullWidth>
                                        <TextField
                                            multiline
                                            rows={4}
                                            label="系统Prompt"
                                            value={system}
                                            onChange={(e) => setSystem(e.target.value)}
                                        />
                                    </FormControl>
                                </Grid>
                            </Grid>}
                            {datasetType === "text" && <Grid rowSpacing={0} columnSpacing={1}>
                                <Grid item xs={12}>
                                    <FormControl variant="outlined" margin="normal" fullWidth>
                                        <TextField
                                            multiline
                                            rows={8}
                                            label="文本"
                                            value={text}
                                            onChange={(e) => setText(e.target.value)}
                                        />
                                    </FormControl>
                                </Grid>
                            </Grid>}
                        </Box>
                        <Box style={styles.buttonsContainer}>
                            <button
                                title="Launch"
                                style={styles.buttonContainer}
                                onClick={() => {
                                    addDatasetData()
                                }
                                }
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
                                    setIsEditShow(false)
                                    setInstruction('')
                                    setInput('')
                                    setOutput('')
                                    setSystem('')
                                    setText('')
                                }}
                            >
                                <Box style={styles.buttonItem}>
                                    <UndoOutlined color="#000000" size="20px"/>
                                </Box>
                            </button>
                        </Box>
                    </div>
                }
                {selectedIndex == 1 &&
                    <div style={styles.drawerCard}>
                        <Box
                            ref={parentRef}
                            style={styles.formContainer}
                            display="flex"
                            flexDirection="column"
                            width="100%"
                            mx="auto"
                        >
                            <Grid container rowSpacing={0} columnSpacing={1}>
                                <Grid item xs={12}>
                                    <FormControl variant="outlined" margin="normal" fullWidth>
                                        <div style={{display: 'flex'}}>
                                            <InputLabel id="fileType-label">文件类型</InputLabel>
                                            <Select
                                                labelId="fileType-label"
                                                style={{flexGrow: 1}}
                                                value={fileType}
                                                onChange={(e) => setFileType(e.target.value)}
                                                label="文件分类"
                                            >
                                                {fileTypeOptions.map((item) => {
                                                    return (
                                                        <MenuItem key={item.value} value={item.value}>
                                                            {item.name}
                                                        </MenuItem>
                                                    )
                                                })}
                                            </Select>
                                            <Button variant="outlined" className="addBtn" onClick={() => {
                                                downloadTemplate()
                                            }}>下载模版</Button>
                                        </div>
                                    </FormControl>
                                </Grid>
                                <Grid item xs={12}>
                                    <FormControl variant="outlined" margin="normal" fullWidth>
                                        <TextField type="file" onChange={(e) => {
                                            setUpload_file(e.target.files[0])
                                        }} required/>
                                    </FormControl>
                                </Grid>
                            </Grid>
                        </Box>
                        <Box style={styles.buttonsContainer}>
                            <button
                                title="Launch"
                                style={styles.buttonContainer}
                                onClick={() => uploadDatasetData()}
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
                }
            </Drawer>
        </Box>
    )
}

export default DatasetDetail
