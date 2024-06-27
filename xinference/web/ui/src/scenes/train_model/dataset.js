import { RocketLaunchOutlined, UndoOutlined } from '@mui/icons-material'
import AddIcon from '@mui/icons-material/Add'
import {
  Box,
  Button,
  Drawer,
  FormControl,
  Grid,
  InputLabel,
  MenuItem,
  Select,
  TextField,
} from '@mui/material'
import React, { useContext, useEffect, useRef, useState } from 'react'
import { useCookies } from 'react-cookie'
import AddTag from './components/addTag'
import { ApiContext } from '../../components/apiContext'
import fetcher from '../../components/fetcher'
import HotkeyFocusTextField from '../../components/hotkeyFocusTextField'
// import ModelCard from './modelCard'
import DatasetCard from './datasetCard'
import styles from './styles/modelCardStyle'
const Dataset = () => {
  //新增数据集是否显示抽屉
  const [isShow, setIsShow] = useState(false)
  //数据集类型
  const [datasetType, setDatasetType] = useState('')
  //数据集类型选项
  const [datasetTypeOptions, setDatasetTypeOptions] = useState([])
  //数据集名称
  const [datasetName,setDatasetName]=useState('')
  //数据集描述
  const [datasetDesc,setDatasetDesc]=useState('')
  //数据集标签
  //const [datasetTag,setDatasetTag]=useState([])
  const [customParametersArr, setCustomParametersArr] = useState([])

  let endPoint = useContext(ApiContext).endPoint
  const parentRef = useRef(null)
  const { isCallingApi, setIsCallingApi } = useContext(ApiContext)
  const { isUpdatingModel } = useContext(ApiContext)
  const { setErrorMsg } = useContext(ApiContext)
  const [cookie] = useCookies(['token'])

  //const [registrationData, setRegistrationData] = useState([])
  const [datasets, setDatasets] = useState([])
  // States used for filtering
  const [searchTerm, setSearchTerm] = useState('')
  const [queryDatasetType, setQueryDatasetType] = useState('all')

  const handleChange = (event) => {
    setSearchTerm(event.target.value)
  }

  const handleDatasetTypeChange = (event) => {
    setQueryDatasetType(event.target.value)
  }

  const filter = (dataset) => {
    if (!dataset || typeof searchTerm !== 'string') return false
    const datasetName = dataset.dataset_name
      ?  dataset.dataset_name.toLowerCase()
      : ''
    const datasetDesc = dataset.dataset_desc
      ? dataset.dataset_desc.toLowerCase()
      : ''

    if (
      !datasetName.includes(searchTerm.toLowerCase()) &&
      !datasetDesc.includes(searchTerm.toLowerCase())
    ) {
      return false
    }
    if (queryDatasetType && queryDatasetType !== 'all') {
      if (dataset.dataset_type.indexOf(queryDatasetType) < 0) {
        return false
      }
    }
    return true
  }

  const update = () => {
    if (
      isCallingApi ||
      isUpdatingModel ||
      (cookie.token !== 'no_auth' && !sessionStorage.getItem('token'))
    )
      return

    try {
      setIsCallingApi(true)

      fetcher(`${endPoint}/v1/dataset/list_dataset`, {
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

          response.json().then((data) => {
            setDatasets(JSON.parse(data))
          })
        }
      })

    } catch (error) {
      console.error('Error:', error)
    } finally {
      setIsCallingApi(false)
    }
  }
  const handleAddDataset = () => {
    setIsShow(true)
    getDatasetType();
  }
  //获取数据集类型
  const getDatasetType = () => {
    setDatasetTypeOptions([{name:'QA数据集',value:'qa'},{name:'预训练数据集',value:'pretrain'}]);
  }

  useEffect(() => {
    update()
  }, [cookie.token])
  const getCustomParametersArr = (arr) => {
    setCustomParametersArr(arr)
  }
    const judgeArr = (arr, str) => {
    if(arr.length==0||arr.indexOf(str)<0){
      return true
    } else {
      return false
    }
  }
   useEffect(() => {
    if (parentRef.current) {
      parentRef.current.scrollTo({
        top: parentRef.current.scrollHeight,
        behavior: 'smooth',
      })
    }
  }, [customParametersArr])
  const style = {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))',
    paddingLeft: '2rem',
    gridGap: '2rem 0rem',
  }

  return (
    <Box m="20px">
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: '150px 1fr',
          columnGap: '20px',
          margin: '0px 2rem 30px 2rem',
        }}
      >
        <FormControl variant="outlined" margin="normal">
          <InputLabel id="ability-select-label">数据集分类</InputLabel>
          <Select
            id="ability"
            labelId="ability-select-label"
            label="Model Ability"
            onChange={handleDatasetTypeChange}
            value={queryDatasetType}
            size="small"
            sx={{ width: '150px' }}
          >
            <MenuItem value="all">全部</MenuItem>
            <MenuItem value="qa">QA数据集</MenuItem>
            <MenuItem value="pretrain">预训练数据集</MenuItem>
          </Select>
        </FormControl>
        <FormControl variant="outlined" margin="normal">
          <div style={{display:'flex'}}>
          <HotkeyFocusTextField
            id="search"
            type="search"
            label="根据数据集名称或描述进行检索"
            value={searchTerm}
            onChange={handleChange}
            style={{flexGrow:1}}
            size="small"
            hotkey="/"
          />
           <Button
          variant="contained"
          size="small"
          endIcon={<AddIcon />}
          className="addBtn"
          onClick={handleAddDataset}
        >
          添加数据集
        </Button></div>
        </FormControl>

      </div>
      <div style={style}>
 {datasets.filter((dataset)=>filter(dataset))
          .map((dataset) => (
              <DatasetCard
                  key={dataset.dataset_name}
                  url={endPoint}
                  datasetData={dataset}
                  />
          ))}

        {/*{registrationData*/}
        {/*  .filter((registration) => filter(registration))*/}
        {/*  .map((filteredRegistration) => (*/}
        {/*    <ModelCard*/}
        {/*      key={filteredRegistration.model_name}*/}
        {/*      url={endPoint}*/}
        {/*      modelData={filteredRegistration}*/}
        {/*      gpuAvailable={gpuAvailable}*/}
        {/*      modelType={'LLM'}*/}
        {/*    />*/}
        {/*  ))}*/}
      </div>
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
                    data:[]
                  }}
                  onGetArr={getCustomParametersArr}
                  onJudgeArr={judgeArr}
                />
              </Grid>
            </Grid>
          </Box>
          <Box style={styles.buttonsContainer}>
            <button
              title="Launch"
              style={styles.buttonContainer}
              onClick={() => setIsShow(false)}
            >
              <Box style={styles.buttonItem}>
                <RocketLaunchOutlined color="#000000" size="20px" />
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
                <UndoOutlined color="#000000" size="20px" />
              </Box>
            </button>
          </Box>
        </div>
      </Drawer>
    </Box>
  )
}

export default Dataset
