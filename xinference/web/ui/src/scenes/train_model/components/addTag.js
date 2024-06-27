import { AddCircle } from '@mui/icons-material'
import DeleteIcon from '@mui/icons-material/Delete'
import { Alert, Box, IconButton, Snackbar, TextField } from '@mui/material'
import React, { useEffect, useState } from 'react'

const AddTag = ({ customData, onGetArr, onJudgeArr }) => {
  const [openSnackbar, setOpenSnackbar] = useState(false)
  const [arr, setArr] = useState(customData.data)
  const [arrId, setArrId] = useState(0)
  const [defaultIndex, setDefaultIndex] = useState(-1)
  // const [isNotUniqueKey, setIsNotUniqueKey] = useState(false)
    console.log(arr);
  useEffect(() => {
    onGetArr(arr)
  }, [arr])

  const updateArr = (index, type, newValue) => {
    setArr(
      arr.map((pair, subIndex) => {
        if (subIndex === index) {
          return newValue
        }
        return pair
      })
    )
    // if (type === customData.key) {
    //   setDefaultIndex(-1)
    //   setIsNotUniqueKey(false)
    //   arr.forEach((pair) => {
    //     if (pair[customData.key] === newValue) {
    //       setDefaultIndex(index)
    //       setIsNotUniqueKey(true)
    //     }
    //   })
    // }
  }

  const handleDeleteArr = (index) => {
    setDefaultIndex(-1)
    setArr(
      arr.filter((_, subIndex) => {
        return index !== subIndex
      })
    )
    onGetArr(arr)
  }

  return (
    <div>
      <Box>
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            margin: '20px 0 0 15px',
          }}
        >
          <div>{customData.title}</div>
          <IconButton
            color="primary"
            onClick={() => {
              setArrId(arrId + 1)
              let obj = customData.value
                // setArr([...arr, obj])
                 console.log(onJudgeArr(arr, obj))
              onJudgeArr(arr, obj)
                ? setArr([...arr, obj])
                : setOpenSnackbar(true)
            }}
          >
            <AddCircle />
          </IconButton>
        </div>
        <Box>
          {arr.map((item, index) => {
            return (
              <Box key={index}>
                <div
                  style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    marginTop: '10px',
                    marginLeft: '10px',
                  }}
                >
                  <TextField
                    label={item}
                    value={item}
                    onChange={() => {
                      updateArr(index, item)
                    }}
                    style={{ width: '88%' }}
                  />
                  <IconButton
                    aria-label="delete"
                    onClick={() => handleDeleteArr(index)}
                    style={{ marginLeft: '10px' }}
                  >
                    <DeleteIcon />
                  </IconButton>
                </div>
                { defaultIndex === index && (
                  <Alert severity="error">
                    {customData.value} 必须唯一
                  </Alert>
                )}
              </Box>
            )
          })}
        </Box>
      </Box>
      <Snackbar
        anchorOrigin={{ vertical: 'top', horizontal: 'center' }}
        open={openSnackbar}
        onClose={() => setOpenSnackbar(false)}
        message="添加内容不能为空"
        key={'top' + 'center'}
      />
    </div>
  )
}

export default AddTag
