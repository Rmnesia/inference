import {
    // SourceSharp,
    AddBoxOutlined,
    ChevronRightOutlined,
    DnsOutlined,
    RocketLaunchOutlined,
    SmartToyOutlined,
    QuizOutlined
} from '@mui/icons-material'
import {
    Box,
    Drawer,
    List,
    ListItem,
    ListItemButton,
    ListItemIcon,
    ListItemText,
    Typography,
    useTheme,
} from '@mui/material'
import {useEffect, useState} from 'react'
import {useLocation, useNavigate} from 'react-router-dom'

import icon from '../media/logo.png'
import {styled} from "@mui/system";

const navItems = [
    {
        text: '数据集管理',
        url:'dataset',
        icon: <DnsOutlined/>,
    },
    {
        text: '模型下载',
        url:'launch_model',
        icon: <SmartToyOutlined/>,
    },
    {
        text: '训练管理',
        url:'train_model',
        icon: <RocketLaunchOutlined/>,
    },
    {
        text: '模型测试',
        url:'test_model',
        icon: <QuizOutlined/>,
    },
    {
        text: '模型注册',
        url:'register_model',
        icon: <AddBoxOutlined/>,
    },
    {
        text: '集群信息',
        url:'cluster_info',
        icon: <DnsOutlined/>,
    },
    {
        text: '配置信息',
        url:'config_info',
        icon: <DnsOutlined/>,
    }
]

const MenuSide = () => {
    const theme = useTheme()
    const {pathname} = useLocation()
    const [active, setActive] = useState('')
    const navigate = useNavigate()
    const [drawerWidth, setDrawerWidth] = useState(
        `${Math.min(Math.max(window.innerWidth * 0.2, 287), 320)}px`
    )
    const StyledListItemButton = styled(ListItemButton)(({theme}) => ({
        '&.Mui-selected': {
            backgroundColor: theme.palette.action.selected,
            // 可以在这里添加更多的选中样式
        },
    }));
    useEffect(() => {
      setActive(pathname)
    }, [pathname])

    useEffect(() => {
        const screenWidth = window.innerWidth
        const maxDrawerWidth = Math.min(Math.max(screenWidth * 0.2, 287), 320)
        setDrawerWidth(`${maxDrawerWidth}px`)

        // Update the drawer width on window resize
        const handleResize = () => {
            const newScreenWidth = window.innerWidth
            const newMaxDrawerWidth = Math.min(
                Math.max(newScreenWidth * 0.2, 287),
                320
            )
            setDrawerWidth(`${newMaxDrawerWidth}px`)
        }

        window.addEventListener('resize', handleResize)
        return () => {
            window.removeEventListener('resize', handleResize)
        }
    }, [])

    return (
        <Drawer
            variant="permanent"
            sx={{
                width: drawerWidth,
                ...theme.mixins.toolbar,
                flexShrink: 0,
                [`& .MuiDrawer-paper`]: {
                    width: drawerWidth,
                    boxSizing: 'border-box',
                },
            }}
        >
            {/* Title */}
            <Box
                display="flex"
                justifyContent="center"
                alignItems="center"
                width="100%"
            >
                <Box display="flex" m="2rem 1rem 0rem 1rem" width="217px">
                    <Box
                        display="flex"
                        justifyContent="space-between"
                        alignItems="center"
                        textTransform="none"
                    >
                        <Box
                            component="img"
                            alt="profile"
                            src={icon}
                            height="60px"
                            width="60px"
                            // borderRadius="50%"
                            sx={{objectFit: 'cover', mr: 1.5}}
                        />
                        <Box textAlign="left">
                            <Typography fontWeight="bold" fontSize="1.7rem">
                                {'部训管推'}
                            </Typography>
                        </Box>
                    </Box>
                </Box>
            </Box>

            <Box>
                <Box width="100%">
                    <Box m="1.5rem 2rem 2rem 3rem"></Box>
                    <List>
                        {navItems.map(({text, icon,url}) => {
                            if (!icon) {
                                return (
                                    <Typography key={text} sx={{m: '2.25rem 0 1rem 3rem'}}>
                                        {text}
                                    </Typography>
                                )
                            }
                          //  const link = text.toLowerCase().replace(' ', '_')
                            return (
                                <ListItem key={text}>
                                    <StyledListItemButton selected={active.indexOf(url)>=0}
                                                          onClick={() => {
                                                                  if (url === 'launch_model') {
                                                                  sessionStorage.setItem('modelType', '/launch_model/llm')
                                                                  navigate('/launch_model/llm')
                                                              } else if (url === 'train_model') {
                                                                  sessionStorage.setItem('modelType', '/train_model/llm')
                                                                  navigate('/train_model/llm')
                                                              } else if (url === 'test_model') {
                                                                  sessionStorage.setItem('modelType', '/test_model/llm')
                                                                  navigate('/test_model/llm')
                                                              }  else if (url === 'config_info') {
                                                                  sessionStorage.setItem('modelType', '/config_info/template')
                                                                  navigate('/config_info/template')
                                                              }
                                                                  else {
                                                                  navigate(`/${url}`)
                                                              }
                                                          }}
                                    >
                                        <ListItemIcon
                                            sx={{
                                                ml: '2rem',
                                            }}
                                        >
                                            {icon}
                                        </ListItemIcon>
                                        <ListItemText primary={text}/>
                                        <ChevronRightOutlined sx={{ml: 'auto'}}/>
                                    </StyledListItemButton>
                                </ListItem>
                            )
                        })}
                    </List>
                </Box>
            </Box>
        </Drawer>
    )
}

export default MenuSide
