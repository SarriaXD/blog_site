import styled, { keyframes } from "styled-components";
import { useEffect, useState } from "react";

const titleAnimation = keyframes`
  0% {
      scale: 0.8;
      opacity: 0;
  }
`;

const IntroductionTitle = styled.h1<{ show: boolean }>`
  font-size: 2.5rem;
  text-align: center;
  line-height: 1.5;
  margin: 0 2.5rem;
  animation: ${titleAnimation} 2s ease;
  transform: ${(props) => (props.show ? "none" : "translateY(-20rem)")};
  opacity: ${(props) => (props.show ? 1 : 0.2)};
  transition:
    transform 1s,
    opacity 1s;
`;

const subtitleAnimation = keyframes`
  0% {
      opacity: 0;
  }
  
  30.1% {
    opacity: 0;
    scale: 0.8;
  }
    
  100% {
    opacity: 1;
    scale: 1;
  }
`;

const IntroductionSubtitle = styled.h1<{ show: boolean }>`
  color: #c2c1c1;
  font-size: 1.8rem;
  text-align: center;
  line-height: 1.5;
  margin: 0 2.5rem;
  animation: ${subtitleAnimation} 2s ease;
  transform: ${(props) => (props.show ? "none" : "translateY(-14rem)")};
  opacity: ${(props) => (props.show ? 1 : 0.2)};
  transition:
    transform 1s,
    opacity 1s;
`;

const ColorfulMyName = styled.b`
  color: transparent;
  background: linear-gradient(90deg, #e8867c, #f5af19, #f12711);
  background-clip: text;
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
`;

export const Introduction = () => {
  const [show, setShow] = useState(true);
  useEffect(() => {
    const onScroll = () => {
      if (window.scrollY < 30) {
        setShow(true);
      } else {
        setShow(false);
      }
    };
    window.addEventListener("scroll", onScroll);
    return () => window.removeEventListener("scroll", onScroll);
  }, []);
  return (
    <>
      <IntroductionTitle show={show}>
        <ColorfulMyName>{" I'm Qi "}</ColorfulMyName>, a software engineer based
        in Canada.
      </IntroductionTitle>
      <IntroductionSubtitle show={show}>
        I specialize in full-stack development.
      </IntroductionSubtitle>
    </>
  );
};
