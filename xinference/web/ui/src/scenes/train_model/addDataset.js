import { RocketLaunchOutlined, UndoOutlined } from '@mui/icons-material'
import { Box, Drawer, FormControl, Grid, TextField } from '@mui/material'
import React, { useRef, useState } from 'react'

import styles from './styles/modelCardStyle'
const AddDataset = ({ isShow }) => {
  const [selected, setSelected] = useState(isShow)
  // Model parameter selections
  const [replica, setReplica] = useState(1)
  const parentRef = useRef(null)
  // Set two different states based on mouse hover
  return (
    <Drawer
      open={selected}
      onClose={() => {
        setSelected(false)
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
                <TextField
                  type="number"
                  InputProps={{
                    inputProps: {
                      min: 1,
                    },
                  }}
                  label="Replica"
                  value={replica}
                  onChange={(e) => setReplica(parseInt(e.target.value, 10))}
                />
              </FormControl>
            </Grid>
          </Grid>
        </Box>
        <Box style={styles.buttonsContainer}>
          <button
            title="Launch"
            style={styles.buttonContainer}
            onClick={() => setSelected(false)}
          >
            <Box style={styles.buttonItem}>
              <RocketLaunchOutlined color="#000000" size="20px" />
            </Box>
          </button>
          <button
            title="Go Back"
            style={styles.buttonContainer}
            onClick={() => {
              setSelected(false)
            }}
          >
            <Box style={styles.buttonItem}>
              <UndoOutlined color="#000000" size="20px" />
            </Box>
          </button>
        </Box>
      </div>
    </Drawer>
  )
}

export default AddDataset
