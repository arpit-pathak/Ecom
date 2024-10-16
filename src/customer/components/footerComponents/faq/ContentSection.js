// import * as React from 'react';
import React, { useState , useRef, useEffect} from "react";
import { styled } from "@mui/material/styles";
import MuiAccordion from "@mui/material/Accordion";
import MuiAccordionSummary from "@mui/material/AccordionSummary";
import MuiAccordionDetails from "@mui/material/AccordionDetails";
import Typography from "@mui/material/Typography";
import { MdKeyboardArrowDown } from "react-icons/md";
import parse from "html-react-parser";

// Custom Accordion created using MUI material
const Accordion = styled((props) => (
  <MuiAccordion disableGutters elevation={0} square {...props} />
))(({ theme }) => ({
  borderBottom: `1px solid ${theme.palette.divider}`,
}));

const AccordionSummary = styled((props) => (
  <MuiAccordionSummary
    expandIcon={<MdKeyboardArrowDown size={24} />}
    {...props}
  />
))(() => ({
  backgroundColor: "rgba(255, 255, 255, .05)",
}));

const AccordionDetails = styled(MuiAccordionDetails)(({ theme }) => ({
  padding: theme.spacing(2),
  borderTop: "1px solid rgba(0, 0, 0, .125)",
}));

export default function ContentSection({ question, answer, id, isExpanded }) {
  const [expanded, setExpanded] = useState(isExpanded);
  const openAccordionRef = useRef(null);
  
  useEffect(() => {
    // Scroll to the  open accordion on page load
    if (openAccordionRef.current && isExpanded) {
      openAccordionRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [isExpanded]);

  const toggleAccordion = () => {
    setExpanded((prevExpanded) => !prevExpanded);
  };

  const AccordionComp = () => {
    return (
      <Accordion key={id} onChange={toggleAccordion} expanded={expanded}>
        <AccordionSummary
          aria-controls="panel1d-content"
          id="panel1d-header"
          sx={expanded ? { color: "#FFA500" } : {}}
        >
          {/* Question with  Number label */}
          <Typography sx={{ fontWeight: "bold" }}>
            {" "}
            {`${id + 1})\u00A0`} {question}
          </Typography>
        </AccordionSummary>
        <AccordionDetails>{answer ? parse(answer) : null}</AccordionDetails>
      </Accordion>
    );
  };

  return (
    <>
      {isExpanded ? (
        <div ref={openAccordionRef}>{AccordionComp()}</div>
      ) : (
        AccordionComp()
      )}
    </>
  );
}
