const styles = {
  container: {
    display: 'block',
    position: 'relative',
    width: '300px',
    height: '300px',
    borderRadius: '20px',
  },
  containerSelected: {
    cursor: 'pointer',
    display: 'block',
    position: 'relative',
    borderRadius: '20px',
  },
  descriptionCard: {
    position: 'relative',
    top: '-1px',
    left: '-1px',
    width: '300px',
    height: '300px',
    padding: '20px',
    borderRadius: '20px',
  },
  drawerCard: {
    position: 'relative',
    padding: '20px 20px 0',
    minHeight: '100%',
    width: '30vw',
  },
  p: {
    'display': '-webkit-box',
    '-webkit-line-clamp': '4',
    '-webkit-box-orient': 'vertical',
    'overflow': 'hidden',
    'textOverflow': 'ellipsis',
    'wordBreak': 'break-word',
    'fontSize': '14px',
    'padding': '0px 10px',
  },
  formContainer: {
    height: '80%',
    overflow: 'auto',
    padding: '0 10px',
  },
  buttonsContainer: {
    position: 'absolute',
    bottom: '50px',
    left: '100px',
    right: '100px',
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  buttonContainer: {
    width: '45%',
    borderWidth: '0px',
    backgroundColor: 'transparent',
  },
  buttonItem: {
    width: '100%',
    padding: '5px',
    borderRadius: '4px',
    border: '1px solid #e5e7eb',
    borderWidth: '1px',
    borderColor: '#e5e7eb',
  },
  instructionText: {
    fontSize: '12px',
    color: '#666666',
    fontStyle: 'italic',
    margin: '10px 0',
    textAlign: 'center',
  },
  iconRow: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    flexFlow:'row'
  },
  iconItem: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    margin: '3px',
    border:'1px solid rgb(189, 189, 189)',
    borderRadius:'5px',
    width:'120px',
    padding:'5px'
  },
  boldIconText: {
    fontWeight: 'bold',
    fontSize: '1.2em',
  },
  muiIcon: {
    fontSize: '1.5em',
    height:'1.2em'
  },
  smallText: {
    fontSize: '0.8em',
  },
}

export default styles
