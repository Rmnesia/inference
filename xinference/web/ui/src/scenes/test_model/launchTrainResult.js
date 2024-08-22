import { Box, FormControl, InputLabel, MenuItem, Select } from '@mui/material'
import React, { useContext, useEffect, useState } from 'react'
import { useCookies } from 'react-cookie'

import { ApiContext } from '../../components/apiContext'
import fetcher from '../../components/fetcher'
import HotkeyFocusTextField from '../../components/hotkeyFocusTextField'
// import ModelCard from './modelCard'
import ExpandableCardList from "../../components/expandableCardList";

const LaunchTrainResult = ({ gpuAvailable }) => {
  console.log(gpuAvailable)
  let endPoint = useContext(ApiContext).endPoint
  const { isCallingApi, setIsCallingApi } = useContext(ApiContext)
  const { setErrorMsg } = useContext(ApiContext)
  const [cookie] = useCookies(['token'])

  const [registrationData, setRegistrationData] = useState([])
  // States used for filtering
  const [searchTerm, setSearchTerm] = useState('')
  const [modelAbility, setModelAbility] = useState('all')

  const handleChange = (event) => {
    setSearchTerm(event.target.value)
  }

  const handleAbilityChange = (event) => {
    setModelAbility(event.target.value)
  }

  const filter = (registration) => {
    if (!registration || typeof searchTerm !== 'string') return false
    const modelName = registration.info.model_name
      ? registration.info.model_name.toLowerCase()
      : ''
    const modelDescription = registration.info.model_description
      ? registration.info.model_description.toLowerCase()
      : ''

    if (
      !modelName.includes(searchTerm.toLowerCase()) &&
      !modelDescription.includes(searchTerm.toLowerCase())
    ) {
      return false
    }
    if (modelAbility && modelAbility !== 'all') {
      if (registration.info.model_ability.indexOf(modelAbility) < 0) {
        return false
      }
    }
    return true
  }

  const query = () => {
    if (
      isCallingApi ||
      (cookie.token !== 'no_auth' && !sessionStorage.getItem('token'))
    )
      return
    try {
      setIsCallingApi(true)

      fetcher(`${endPoint}/logs/list_logs`, {
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
            if(data.model_list&&data.model_list.length>0) {
              const builtinRegistrations = data.model_list.filter((v) =>filter(v))
              setRegistrationData(builtinRegistrations)
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

  useEffect(() => {
    query()
  }, [cookie.token])

  // const style = {
  //   display: 'grid',
  //   gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))',
  //   paddingLeft: '2rem',
  //   gridGap: '2rem 0rem',
  // }

  return (
    <Box m="20px">
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: '150px 1fr',
          columnGap: '20px',
          margin: '30px 2rem',
        }}
      >
        <FormControl variant="outlined" margin="normal">
          <InputLabel id="ability-select-label">模型能力</InputLabel>
          <Select
            id="ability"
            labelId="ability-select-label"
            label="模型能力"
            onChange={handleAbilityChange}
            value={modelAbility}
            size="small"
            sx={{ width: '150px' }}
          >
            <MenuItem value="all">all</MenuItem>
            <MenuItem value="generate">generate</MenuItem>
            <MenuItem value="chat">chat</MenuItem>
            <MenuItem value="vision">vl-chat</MenuItem>
          </Select>
        </FormControl>
        <FormControl variant="outlined" margin="normal">
          <HotkeyFocusTextField
            id="search"
            type="search"
            label="根据模型名称或描述进行检索"
            value={searchTerm}
            onChange={handleChange}
            size="small"
            hotkey="/"
          />
        </FormControl>
      </div>
      {/*<div style={style}>*/}
      {/*  {registrationData*/}
      {/*    .filter((registration) => filter(registration))*/}
      {/*    .map((filteredRegistration) => (*/}
      {/*      <ModelCard*/}
      {/*        key={filteredRegistration.model_name}*/}
      {/*        url={endPoint}*/}
      {/*        modelData={filteredRegistration}*/}
      {/*        gpuAvailable={gpuAvailable}*/}
      {/*        modelType={'LLM'}*/}
      {/*      />*/}
      {/*    ))}*/}
      {/*</div>*/}
      <ExpandableCardList data={registrationData
          .filter((registration) => filter(registration))} type={'test'}/>
    </Box>
  )
}

export default LaunchTrainResult
