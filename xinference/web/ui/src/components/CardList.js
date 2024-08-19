import React, { useState } from 'react';
import { Card, CardContent, CardActionArea, Typography, List, ListItem, ListItemText, IconButton, Collapse } from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';

const SubCard = ({ title }) => (
  <ListItem>
    <ListItemText primary={title} />
  </ListItem>
);

const CardList = () => {
  const [openCard, setOpenCard] = useState(null);

  const handleCardClick = (cardId) => {
    if (openCard === cardId) {
      setOpenCard(null);
    } else {
      setOpenCard(cardId);
    }
  };

  return (
    <List>
      {[...Array(5)].map((_, index) => (
        <React.Fragment key={index}>
          <Card onClick={() => handleCardClick(index)}>
            <CardActionArea>
              <CardContent>
                <Typography variant="h6">Card Title {index + 1}</Typography>
              </CardContent>
            </CardActionArea>
          </Card>
          <Collapse in={openCard === index}>
            <div style={{ backgroundColor: '#f0f0f0', padding: '16px' }}>
              <IconButton onClick={() => handleCardClick(index)} aria-label="close">
                <CloseIcon />
              </IconButton>
              <List>
                <SubCard title="Sub Card 1" />
                <SubCard title="Sub Card 2" />
                <SubCard title="Sub Card 3" />
              </List>
            </div>
          </Collapse>
        </React.Fragment>
      ))}
    </List>
  );
};

export default CardList;