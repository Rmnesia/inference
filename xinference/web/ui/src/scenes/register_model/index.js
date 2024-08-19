import { TabContext, TabList, TabPanel } from '@mui/lab'
import { Box, Tab } from '@mui/material'
import React, { useEffect } from 'react'
import { useCookies } from 'react-cookie'
import { useNavigate } from 'react-router-dom'

import ErrorMessageSnackBar from '../../components/errorMessageSnackBar'
import Title from '../../components/Title'
import RegisterModelComponent from './registerModel'

const RegisterModel = () => {
  const [tabValue, setTabValue] = React.useState('/register_model/llm')
  const [cookie] = useCookies(['token'])
  const navigate = useNavigate()

  useEffect(() => {
    if (cookie.token === '' || cookie.token === undefined) {
      return
    }
    if (cookie.token !== 'no_auth' && !sessionStorage.getItem('token')) {
      navigate('/login', { replace: true })
      return
    }
  }, [cookie.token])

  return (
    <Box m="20px">
      <Title title="模型注册" />
      <ErrorMessageSnackBar />
      <TabContext value={tabValue}>
        <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
          <TabList
            value={tabValue}
            onChange={(e, v) => {
              setTabValue(v)
            }}
            aria-label="tabs"
          >
            <Tab label="语言模型" value="/register_model/llm" />
            {/*<Tab label="嵌入模型" value="/register_model/embedding" />*/}
            {/*<Tab label="重排模型" value="/register_model/rerank" />*/}
            {/*<Tab label="图像模型" value="/register_model/image" />*/}
            {/*<Tab label="音频模型" value="/register_model/audio" />*/}
          </TabList>
        </Box>
        <TabPanel value="/register_model/llm" sx={{ padding: 0 }}>
          <RegisterModelComponent
            modelType="LLM"
            customData={{
              version: 1,
              model_name: 'custom-llm',
              model_description: '模型描述',
              context_length: 2048,
              model_lang: ['en'],
              model_ability: ['generate'],
              model_family: '',
              model_specs: [
                {
                  model_uri: '/path/to/llama-2',
                  model_size_in_billions: 7,
                  model_format: 'pytorch',
                  quantizations: ['none'],
                },
              ],
              prompt_style: undefined,
            }}
          />
        </TabPanel>
        <TabPanel value="/register_model/embedding" sx={{ padding: 0 }}>
          <RegisterModelComponent
            modelType="embedding"
            customData={{
              model_name: 'custom-embedding',
              dimensions: 768,
              max_tokens: 512,
              model_uri: '/path/to/embedding-model',
              language: ['en'],
            }}
          />
        </TabPanel>
        <TabPanel value="/register_model/rerank" sx={{ padding: 0 }}>
          <RegisterModelComponent
            modelType="rerank"
            customData={{
              model_name: 'custom-rerank',
              model_uri: '/path/to/rerank-model',
              language: ['en'],
            }}
          />
        </TabPanel>
        <TabPanel value="/register_model/image" sx={{ padding: 0 }}>
          <RegisterModelComponent
            modelType="image"
            customData={{
              model_name: 'custom-image',
              model_uri: '/path/to/image-model',
              model_family: 'stable_diffusion',
              controlnet: [],
            }}
          />
        </TabPanel>
        <TabPanel value="/register_model/audio" sx={{ padding: 0 }}>
          <RegisterModelComponent
            modelType="audio"
            customData={{
              model_name: 'custom-audio',
              model_uri: '/path/to/audio-model',
              multilingual: false,
              model_family: 'whisper',
            }}
          />
        </TabPanel>
      </TabContext>
    </Box>
  )
}

export default RegisterModel
