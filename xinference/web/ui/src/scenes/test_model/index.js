import {Box, Tab} from '@mui/material'
import React, { useContext, useEffect, useState } from 'react'
import { useCookies } from 'react-cookie'
import { useNavigate } from 'react-router-dom'

import { ApiContext } from '../../components/apiContext'
import ErrorMessageSnackBar from '../../components/errorMessageSnackBar'
import Title from '../../components/Title'
import LaunchCustom from './launchCustom'
import LaunchLLM from './launchLLM'
import LaunchModelComponent from './LaunchModelComponent'
import {TabContext, TabList, TabPanel} from "@mui/lab";

const TestModel = () => {
  let endPoint = useContext(ApiContext).endPoint
   const [value, setValue] = React.useState(
    sessionStorage.getItem('modelType')
      ? sessionStorage.getItem('modelType')
      : '/test_model/llm'
  )
  const [gpuAvailable, setGPUAvailable] = useState(-1)
  const { setErrorMsg } = useContext(ApiContext)
  const [cookie] = useCookies(['token'])
  const navigate = useNavigate()

  const handleTabChange = (event, newValue) => {
    setValue(newValue)
    navigate(newValue)
    sessionStorage.setItem('modelType', newValue)
    newValue === '/test_model/custom/llm'
      ? sessionStorage.setItem('subType', newValue)
      : ''
  }
  useEffect(() => {
    if (cookie.token === '' || cookie.token === undefined) {
      return
    }
    if (cookie.token !== 'no_auth' && !sessionStorage.getItem('token')) {
      navigate('/login', { replace: true })
      return
    }

    if (gpuAvailable === -1) {
      fetch(endPoint + '/v1/cluster/devices', {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      }).then((res) => {
        if (!res.ok) {
          // Usually, if some errors happen here, check if the cluster is available
          res.json().then((errorData) => {
            setErrorMsg(
              `Server error: ${res.status} - ${
                errorData.detail || 'Unknown error'
              }`
            )
          })
        } else {
          res.json().then((data) => {
            setGPUAvailable(parseInt(data, 10))
          })
        }
      })
    }
  }, [cookie.token])

  useEffect(() => {})
  return (
    <Box m="20px">
      <Title title="模型测试" />
      <ErrorMessageSnackBar />
      <TabContext value={value}>
        <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
          <TabList value={value} onChange={handleTabChange} aria-label="tabs">
            <Tab label="语言模型" value="/test_model/llm" />
            {/*<Tab label="嵌入模型" value="/test_model/embedding" />*/}
            {/*<Tab label="重排模型" value="/test_model/rerank" />*/}
            {/*<Tab label="图像模型" value="/test_model/image" />*/}
            {/*<Tab label="音频模型" value="/test_model/audio" />*/}
            {/*<Tab label="自定义模型" value="/test_model/custom/llm" />*/}
          </TabList>
        </Box>
        <TabPanel value="/test_model/llm" sx={{ padding: 0 }}>
          <LaunchLLM gpuAvailable={gpuAvailable} />
        </TabPanel>
        <TabPanel value="/test_model/embedding" sx={{ padding: 0 }}>
          <LaunchModelComponent
            modelType={'embedding'}
            gpuAvailable={gpuAvailable}
          />
        </TabPanel>
        <TabPanel value="/test_model/rerank" sx={{ padding: 0 }}>
          <LaunchModelComponent
            modelType={'rerank'}
            gpuAvailable={gpuAvailable}
          />
        </TabPanel>
        <TabPanel value="/test_model/image" sx={{ padding: 0 }}>
          <LaunchModelComponent modelType={'image'} />
        </TabPanel>
        <TabPanel value="/test_model/audio" sx={{ padding: 0 }}>
          <LaunchModelComponent modelType={'audio'} />
        </TabPanel>
        <TabPanel value="/test_model/custom/llm" sx={{ padding: 0 }}>
          <LaunchCustom gpuAvailable={gpuAvailable} />
        </TabPanel>
      </TabContext>
    </Box>
  )
}

export default TestModel
