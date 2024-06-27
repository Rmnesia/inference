import { Box } from '@mui/material'
import React, {  useEffect  } from 'react'
import { useCookies } from 'react-cookie'
import { useNavigate } from 'react-router-dom'
import ErrorMessageSnackBar from '../../components/errorMessageSnackBar'
import Title from '../../components/Title'
import Dataset from './dataset'
import SuccessMessageSnackBar from "../../components/successMessageSnackBar";

const Datasets = () => {
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

  useEffect(() => {})
  return (
    <Box m="20px">
      <Title title="数据集管理" />
      <ErrorMessageSnackBar />
      <SuccessMessageSnackBar/>
      <Dataset  />
    </Box>
  )
}

export default Datasets
