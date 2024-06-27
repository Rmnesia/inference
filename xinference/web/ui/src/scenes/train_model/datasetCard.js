import {
  ChatOutlined,
  EditNoteOutlined,
  HelpCenterOutlined,
  RocketLaunchOutlined,
  UndoOutlined,
} from '@mui/icons-material'
import DeleteIcon from '@mui/icons-material/Delete'
//import VisibilitySharpIcon from '@mui/icons-material/VisibilitySharp';
import MoreHorizSharpIcon from '@mui/icons-material/MoreHorizSharp';
import {

  Box,
  Chip,
  CircularProgress,
  Drawer,
  FormControl,
  Grid,
  IconButton,
  InputLabel,
  MenuItem,
  Select,
  Snackbar,
  Stack,
  TextField,
} from '@mui/material'
import Paper from '@mui/material/Paper'
import React, { useContext, useEffect, useRef, useState } from 'react'
import { useNavigate } from 'react-router-dom'

import { ApiContext } from '../../components/apiContext'
import fetcher from '../../components/fetcher'
import TitleTypography from '../../components/titleTypography'

import styles from './styles/modelCardStyle'
import AddTag from "./components/addTag";

const DatasetCard = ({
  url,
  datasetData,
}) => {
  console.log(datasetData);
  const [hover, setHover] = useState(false)
  const [selected, setSelected] = useState(false)
  const [openSnackbar, setOpenSnackbar] = useState(false)
  const { isCallingApi, setIsCallingApi } = useContext(ApiContext)
  const { isUpdatingModel } = useContext(ApiContext)
  const { setErrorMsg } = useContext(ApiContext)
  const navigate = useNavigate()

  // Dataset parameter selections
  //const [datasetUID, setDatasetUID] = useState('')
    //数据集类型
  const [datasetType, setDatasetType] = useState(datasetData.dataset_type)
  //数据集类型选项
  const [datasetTypeOptions, setDatasetTypeOptions] = useState([])
  //数据集名称
  const [datasetName,setDatasetName]=useState(datasetData.dataset_name)
  //数据集描述
  const [datasetDesc,setDatasetDesc]=useState(datasetData.dataset_desc)
  //数据集标签
  //const [datasetTag,setDatasetTag]=useState([])
  const [customParametersArr, setCustomParametersArr] = useState([])
  const [customDeleted, setCustomDeleted] = useState(false)
  const parentRef = useRef(null)

  useEffect(() => {
    if (parentRef.current) {
      parentRef.current.scrollTo({
        top: parentRef.current.scrollHeight,
        behavior: 'smooth',
      })
    }
  }, [customParametersArr])

  const launchDataset = (url) => {
    if (isCallingApi || isUpdatingModel) {
      return
    }
    setIsCallingApi(true)
    const datasetWithID = {
      // If user does not fill model_uid, pass null (None) to server and server generates it.
     // dataset_uid: datasetUID.trim() === '' ? null : datasetUID.trim(),
      dataset_name: datasetData.dataset_name,
      dataset_type: datasetData.dataset_type,
      dataset_desc: datasetData.dataset_desc,
      dataset_tags:datasetData.dataset_tags,
    }
    // First fetcher request to initiate the model
    fetcher(url + '/v1/datasets', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(datasetWithID),
    })
      .then((response) => {
        if (!response.ok) {
          // Assuming the server returns error details in JSON format
          response.json().then((errorData) => {
            setErrorMsg(
              `Server error: ${response.status} - ${
                errorData.detail || 'Unknown error'
              }`
            )
          })
        } else {
           navigate(`/dataset`)
          // sessionStorage.setItem(
          //   'runningModelType',
          //   `/running_models/${modelType}`
          // )
        }
        setIsCallingApi(false)
      })
      .catch((error) => {
        console.error('Error:', error)
        setIsCallingApi(false)
      })
  }

  const handeView=(e)=>{
    e.stopPropagation()
     navigate(`/dataset/detail/${datasetData.dataset_name}`)
  }

  const handeCustomDelete = (e) => {
    e.stopPropagation()
    const subType = sessionStorage.getItem('subType').split('/')
    if (subType) {
      subType[3]
      fetcher(
        url +
          `/v1/dataset_registrations/${datasetData.dataset_name}`,
        {
          method: 'DELETE',
          headers: {
            'Content-Type': 'application/json',
          },
        }
      )
        .then(() => {
          setCustomDeleted(true)
        })
        .catch(console.error)
    }
  }

   const judgeArr = (arr, str) => {
    if(arr.length==0||arr.indexOf(str)<0){
      return true
    } else {
      return false
    }
  }
  //获取数据集类型
  const getDatasetType = () => {
    setDatasetTypeOptions([{name:'QA数据集',value:'qa'},{name:'预训练数据集',value:'pretrain'}]);
  }

  const getCustomParametersArr = (arr) => {
    setCustomParametersArr(arr)
  }

  // Set two different states based on mouse hover
  return (
    <Paper
      style={hover ? styles.containerSelected : styles.container}
      onMouseEnter={() => setHover(true)}
      onMouseLeave={() => setHover(false)}
      onClick={() => {
        if (!selected && !customDeleted) {
          setSelected(true)
          getDatasetType()
        }
      }}
      elevation={hover ? 24 : 4}
    >

        <Box style={styles.descriptionCard}>
            <Stack direction="row" spacing={1} useFlexGap>
              <TitleTypography value={datasetData.dataset_name} />
               <IconButton
                aria-label="view"
                onClick={handeView}
              >
                <MoreHorizSharpIcon />
              </IconButton>
              {/*    <IconButton*/}
              {/*  aria-label="delete"*/}
              {/*  onClick={handeCustomDelete}*/}
              {/*  disabled={customDeleted}*/}
              {/*>*/}
              {/*  <VisibilitySharpIcon />*/}
              {/*</IconButton>*/}
              <IconButton
                aria-label="delete"
                onClick={handeCustomDelete}
                disabled={customDeleted}
              >
                <DeleteIcon />
              </IconButton>
            </Stack>

          <Stack
            spacing={1}
            direction="row"
            useFlexGap
            flexWrap="wrap"
            sx={{ marginLeft: 1 }}
          >
            {datasetData.dataset_tags &&
              (() => {
                return datasetData.dataset_tags.map((v) => {
                  return (
                    <Chip key={v} label={v} variant="outlined" size="small" />
                  )
                })
              })()}
            {(() => {
              if (customDeleted) {
                return <Chip label="Deleted" variant="outlined" size="small" />
              }
            })()}
          </Stack>
          {datasetData.dataset_desc && (
            <p style={styles.p} title={datasetData.dataset_desc}>
              {datasetData.dataset_desc}
            </p>
          )}

          <div style={styles.iconRow}>
            <div style={styles.iconItem}>
              <span style={styles.boldIconText}>
                {Math.floor(1000000 / 1000)}K
              </span>
              <small style={styles.smallText}>数据集大小</small>
            </div>
            {(() => {
              if (
                datasetData.dataset_type=='qa'
              ) {
                return (
                  <div style={styles.iconItem}>
                    <ChatOutlined style={styles.muiIcon} />
                    <small style={styles.smallText}>QA数据集</small>
                  </div>
                )
              } else if (
                datasetData.dataset_type=='pretrain'
              ) {
                return (
                  <div style={styles.iconItem}>
                    <EditNoteOutlined style={styles.muiIcon} />
                    <small style={styles.smallText}>预训练数据集</small>
                  </div>
                )
              } else {
                return (
                  <div style={styles.iconItem}>
                    <HelpCenterOutlined style={styles.muiIcon} />
                    <small style={styles.smallText}>其他数据集</small>
                  </div>
                )
              }
            })()}
          </div>
        </Box>

      <Drawer
        open={selected}
        onClose={() => {
          setSelected(false)
          setHover(false)
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
                <Grid item xs={12}>
                  <FormControl variant="outlined" margin="normal" fullWidth>
                    <InputLabel id="datasetType-label">数据集分类</InputLabel>
                    <Select
                      labelId="datasetType-label"
                      value={datasetType}
                      onChange={(e) => setDatasetType(e.target.value)}
                      label="数据集分类"
                    >
                       {datasetTypeOptions.map((item) => {
                        return (
                          <MenuItem key={item.value} value={item.value}>
                            {item.name}
                          </MenuItem>
                        )
                      })}
                    </Select>
                  </FormControl>
                </Grid>
                <Grid item xs={12}>
                <FormControl variant="outlined" margin="normal" fullWidth>
                  <TextField
                    label="数据集名称"
                    value={datasetName}
                    onChange={(e) => setDatasetName(e.target.value)}
                  />
                </FormControl>
              </Grid>
                <Grid item xs={12}>
                <FormControl variant="outlined" margin="normal" fullWidth>
                  <TextField
                    label="数据集描述"
                    value={datasetDesc}
                    onChange={(e) => setDatasetDesc(e.target.value)}
                  />
                </FormControl>
              </Grid>
                <Grid item xs={12}>
                 <AddTag
                  customData={{
                    title: '添加数据集标签',
                    value: '',
                    data:datasetData.dataset_tags
                  }}
                  onGetArr={getCustomParametersArr}
                  onJudgeArr={judgeArr}
                />
              </Grid>
              </Grid>
            </Box>

          <Box style={styles.buttonsContainer}>
            <button
              title="保存"
              style={styles.buttonContainer}
              onClick={() => launchDataset(url, datasetData)}
              disabled={
                ((isCallingApi || isUpdatingModel || !datasetData ) || !judgeArr(customParametersArr, ''))
              }
            >
              {(() => {
                if (isCallingApi || isUpdatingModel) {
                  return (
                    <Box
                      style={{
                        ...styles.buttonItem,
                        backgroundColor: '#f2f2f2',
                      }}
                    >
                      <CircularProgress
                        size="20px"
                        sx={{
                          color: '#000000',
                        }}
                      />
                    </Box>
                  )
                }
                else {
                  return (
                    <Box style={styles.buttonItem}>
                      <RocketLaunchOutlined color="#000000" size="20px" />
                    </Box>
                  )
                }
              })()}
            </button>
            <button
              title="返回"
              style={styles.buttonContainer}
              onClick={() => {
                setSelected(false)
                setHover(false)
              }}
            >
              <Box style={styles.buttonItem}>
                <UndoOutlined color="#000000" size="20px" />
              </Box>
            </button>
          </Box>
        </div>
      </Drawer>
      <Snackbar
        anchorOrigin={{ vertical: 'top', horizontal: 'center' }}
        open={openSnackbar}
        onClose={() => setOpenSnackbar(false)}
        message="添加前请填写完整的参数！！"
        key={'top' + 'center'}
      />
    </Paper>
  )
}

export default DatasetCard
