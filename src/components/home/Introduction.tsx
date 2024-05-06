import styled from "styled-components";
import { motion, useMotionValueEvent, useScroll } from "framer-motion";
import { useState } from "react";

const IntroductionTitle = styled(motion.h1)`
  font-size: 2.5rem;
  text-align: center;
  line-height: 1.5;
  margin: 0 2.5rem;
`;

const IntroductionSubtitle = styled(IntroductionTitle)`
  color: #c2c1c1;
  font-size: 1.8rem;
`;

const ColorfulMyName = styled.b`
  color: transparent;
  background: linear-gradient(90deg, #e8867c, #f5af19, #f12711);
  background-clip: text;
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
`;

const variants = {
  hidden: {
    scale: 0.8,
    opacity: 0,
  },
  visible: (subtitle: boolean) => ({
    scale: 1,
    opacity: 1,
    transition: {
      delay: subtitle ? 0.5 : 0,
      duration: 1,
    },
  }),
  back: {
    y: 0,
    scale: 1,
    opacity: 1,
    transition: {
      type: "spring",
      stiffness: 100,
      damping: 12,
    },
  },
  leave_1: (subtitle: boolean) => ({
    y: subtitle ? -40 : -80,
    scale: 0.8,
    opacity: 0.2,
    transition: {
      type: "spring",
      stiffness: 30,
      damping: 12,
    },
  }),
  leave_2: (subtitle: boolean) => ({
    y: subtitle ? -200 : -300,
    scale: 0.9,
    opacity: 0.1,
    transition: {
      type: "spring",
      stiffness: 30,
      damping: 12,
    },
  }),
};

export const Introduction = () => {
  const [animationState, setAnimationState] = useState("visible");
  const { scrollY } = useScroll();
  useMotionValueEvent(scrollY, "change", (latestValue) => {
    if (latestValue > 120) {
      setAnimationState("leave_2");
    } else if (latestValue > 20) {
      setAnimationState("leave_1");
    } else {
      setAnimationState("back");
    }
  });
  return (
    <>
      <IntroductionTitle
        custom={false}
        variants={variants}
        initial={"hidden"}
        animate={animationState}
      >
        <ColorfulMyName>{" I'm Qi "}</ColorfulMyName>, a software engineer based
        in Canada.
      </IntroductionTitle>
      <IntroductionSubtitle
        custom={true}
        variants={variants}
        initial={"hidden"}
        animate={animationState}
      >
        I specialize in full-stack development.
      </IntroductionSubtitle>
    </>
  );
};
