import { TabContext, TabList, TabPanel } from '@mui/lab'
import { Box, Tab } from '@mui/material'
import React, { useContext, useEffect, useState } from 'react'
import { useCookies } from 'react-cookie'
import { useNavigate } from 'react-router-dom'

import { ApiContext } from '../../components/apiContext'
import ErrorMessageSnackBar from '../../components/errorMessageSnackBar'
import Title from '../../components/Title'
import Grid from "@mui/material/Unstable_Grid2";
import Paper from "@mui/material/Paper";
// import TableTitle from "../../components/tableTitle";
// import NodeInfo from "../cluster_info/nodeInfo";
import {DataGrid} from "@mui/x-data-grid";

const ConfigInfo = () => {
  let endPoint = useContext(ApiContext).endPoint
  const [value, setValue] = React.useState(
    sessionStorage.getItem('modelType')
      ? sessionStorage.getItem('modelType')
      : '/config_info/template'
  )
  const [gpuAvailable, setGPUAvailable] = useState(-1)

  const { setErrorMsg } = useContext(ApiContext)
  const [cookie] = useCookies(['token'])
  const navigate = useNavigate()
  const [listData,setListData]=useState([])
  const templdateDatas=[
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
    //模版列表对应列
  const templateColumns=[
        {
            field: 'model',
            headerName: '模型',
            flex: 1,
        },{
            field: 'template',
            headerName: '对应模版',
            flex: 1,
        }]
  const handleTabChange = (event, newValue) => {
    setValue(newValue)
    navigate(newValue)
    sessionStorage.setItem('modelType', newValue)
    newValue === '/config_info/custom/llm'
      ? sessionStorage.setItem('subType', newValue)
      : ''
  }
  const dataGridStyle = {
        '& .MuiDataGrid-cell': {
            borderBottom: 'none',
            fontSize: '14px',
        },
        '& .MuiDataGrid-columnHeaders': {
            borderBottom: 'none',
            backgroundColor: '#EFEFEF',
            fontSize: '14px',
        },
        '& .MuiDataGrid-columnHeaderTitle': {
            fontWeight: 'bold',
        },
        '& .MuiDataGrid-virtualScroller': {
            overflowX: 'visible !important',
            overflow: 'visible',
        },
        '& .MuiDataGrid-footerContainer': {
            borderTop: 'none',
        },
        // 'border-width': '0px',
        '& .MuiDataGrid-row': {
            '&:nth-of-type(even)': {
                backgroundColor: '#F5F5F5',
            },
        },
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

  useEffect(() => {
      templdateDatas.forEach((obj)=>{
            obj.id = `id-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
      })
      console.log(templdateDatas)
      setListData(templdateDatas)
  },[templdateDatas])

  return (
    <Box m="20px">
      <Title title="配置信息" />
      <ErrorMessageSnackBar />
      <TabContext value={value}>
        <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
          <TabList value={value} onChange={handleTabChange} aria-label="tabs">
            <Tab label="提示模版" value="/config_info/template" />
          </TabList>
        </Box>
        <TabPanel value="/config_info/template" sx={{ padding: 0 }}>
 <Grid item xs={12}>
          <Paper
            sx={{
              padding: 2,
              display: 'flex',
              overflow: 'auto',
              flexDirection: 'column',
            }}
          >
             <DataGrid
                        rows={listData}
                        columns={templateColumns}
                        getRowId={(row) => row.model + new Date().getTime()}
                        sx={dataGridStyle}
             />
          </Paper>
        </Grid>
        </TabPanel>
      </TabContext>
    </Box>
  )
}

export default ConfigInfo
