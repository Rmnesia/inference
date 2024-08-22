import React, {useState} from 'react';
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
//import CardMedia from '@mui/material/CardMedia';
import Typography from '@mui/material/Typography';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import IconButton from '@mui/material/IconButton';
import Collapse from '@mui/material/Collapse';
import {Avatar, CardHeader, Chip, Stack} from "@mui/material";
import {ChatOutlined, EditNoteOutlined, HelpCenterOutlined} from "@mui/icons-material";
import styles from './styles/modelCardStyle';
import {useNavigate} from "react-router-dom";

const colorArr = ['#F4F5FE', '#FDF6F4'];

function ExpandableCard({card,type, index}) {
    console.log(card);
    const navigate = useNavigate()
    const [expanded, setExpanded] = useState(false);
    const [hover, setHover] = useState(false)
    const handleExpandClick = () => {
        setExpanded(!expanded);
    };
    const handleCardClick = () => {
        setExpanded(!expanded)
    }
    const handeView = (path) => {
        if(type=='train') {
            navigate(`/train_model/trainResult/${card.info.model_name}?path=${path}`)
        }
        else if(type=="test"){
            navigate(`/test_model/detail/${card.info.model_name}?path=${path}`)
        }
    }
    return (
        <Card elevation={hover ? 40 : 2} style={hover ? styles.containerSelected : {}}
              onMouseEnter={() => setHover(true)}
              onMouseLeave={() => setHover(false)}
              sx={{mb: '20px', bgcolor: colorArr[index % 2], cursor: 'pointer', borderRadius: '10px'}}
              onClick={() => handleCardClick()}>
            <CardHeader sx={{paddingBottom: '5px !important'}} avatar={<Avatar sx={{bgcolor: '#A26BFD'}}
                                                                               aria-label="recipe">{card.info.model_name.substring(0, 1)}</Avatar>}
                        action={<IconButton aria-label="settings" onClick={handleExpandClick}
                                            aria-expanded={expanded}><ExpandMoreIcon/></IconButton>}
                        title={card.info.model_name} titleTypographyProps={{variant: 'h4'}}
                        subheader={<Stack spacing={1}
                                          direction="row"
                                          useFlexGap
                                          flexWrap="wrap"
                                          sx={{marginLeft: 1, paddingTop: 0}}>
                            {
                                (() => {
                                    return card.info.model_lang.map((v) => {
                                        return (
                                            <Chip key={v} label={v} variant="outlined" size="small"/>
                                        )
                                    })
                                })()
                            }
                        </Stack>}
            />
            <CardContent sx={{padding: '0px 16px 16px 16px !important'}}>
                <div style={{display: 'flex'}}>
                    <div style={{display: 'flex', flexFlow: 'column', flex: 1}}>
                        <Typography gutterBottom variant="h5" component="div">
                            {card.info.model_description}
                        </Typography>
                    </div>
                    <div style={styles.iconRow}>
                        <div style={styles.iconItem}>
                            <small style={styles.smallText}>context length</small>
                            <span style={styles.boldIconText}>
                {Math.floor(card.info.context_length / 1000)}K
              </span>

                        </div>
                        {(() => {
                            if (
                                card.info.model_ability &&
                                card.info.model_ability.includes('chat')
                            ) {
                                return (
                                    <div style={styles.iconItem}>
                                        <small style={styles.smallText}>chat model</small>
                                        <ChatOutlined style={styles.muiIcon}/>
                                    </div>
                                )
                            } else if (
                                card.info.model_ability &&
                                card.info.model_ability.includes('generate')
                            ) {
                                return (
                                    <div style={styles.iconItem}>
                                        <small style={styles.smallText}>generate model</small>
                                        <EditNoteOutlined style={styles.muiIcon}/>
                                    </div>
                                )
                            } else {
                                return (
                                    <div style={styles.iconItem}>
                                        <small style={styles.smallText}>other model</small>
                                        <HelpCenterOutlined style={styles.muiIcon}/>
                                    </div>
                                )
                            }
                        })()}
                    </div>
                </div>
                <div style={{
                    display: 'flex',
                    flexFlow: 'column',
                    flex: 1,
                    borderTop: '1px solid rgba(0, 0, 0, 0.12)',
                    paddingTop: '10px',
                    marginTop: '10px'
                }}>
                    <Typography gutterBottom variant="h5" component="div">
                        显示训练模型
                    </Typography>
                </div>
                {/*<IconButton onClick={handleExpandClick} aria-expanded={expanded}>*/}
                {/*  <ExpandMoreIcon />*/}
                {/*</IconButton>*/}
                <Collapse in={expanded} timeout="auto" unmountOnExit>
                    <div style={{display: 'flex', flexFlow: 'row', flexWrap: 'wrap'}}>
                        {card.path.map(subCard => (
                            <Card key={subCard} sx={{mt: 1, height: '240px', width: '240px', margin: '10px'}}
                                  onClick={(e) => {
                                      e.preventDefault();
                                      handeView(subCard);
                                  }}>
                                <CardContent>
                                    <Typography variant="body2" color="text.secondary">
                                        {subCard}
                                    </Typography>

                                    <Stack spacing={1}
                                           direction="row"
                                           useFlexGap
                                           flexWrap="wrap"
                                           sx={{marginLeft: 1}}>
                                        {
                                            (() => {
                                                return card.info.model_lang.map((v) => {
                                                    return (
                                                        <Chip key={v} label={v} variant="outlined" size="small"/>
                                                    )
                                                })
                                            })()
                                        }
                                    </Stack>
                                    <p> {card.info.model_description}</p>
                                </CardContent>
                            </Card>
                        ))}
                    </div>
                </Collapse>
            </CardContent>
        </Card>
    );
}

export default function ExpandableCardList({data,type}) {
    return (
        <div style={{flexFlow: 'column', margin: '10px 2rem'}}>
            {data.map((card, index) => (
                <ExpandableCard key={index} card={card} type={type} index={index}/>
            ))}
        </div>
    );
}