import styled from "styled-components";
import { motion, useScroll, useTransform } from "framer-motion";

const IntroductionTitle = styled(motion.h1)`
  font-size: 2.5rem;
  text-align: center;
  line-height: 1.5;
  margin: 0 2.5rem;
`;

const ColorfulMyName = styled.b`
  color: transparent;
  background: linear-gradient(90deg, #e8867c, #f5af19, #f12711);
  background-clip: text;
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
`;

const IntroductionSubtitle = styled(motion.h1)`
  color: #c2c1c1;
  font-size: 1.8rem;
  text-align: center;
  line-height: 1.5;
  margin: 0 2.5rem;
`;

const animationVariants = {
  hidden: { opacity: 0, scale: 0.8 },
  visible: (i: number) => ({
    opacity: 1,
    scale: 1,
    transition: {
      delay: i * 0.6,
      duration: 1,
    },
  }),
};
export const Introduction = () => {
  const { scrollY } = useScroll();
  const y0 = useTransform(scrollY, [0, 100], [0, -200]);
  const y1 = useTransform(scrollY, [0, 100], [0, -120]);
  return (
    <>
      <>
        <IntroductionTitle
          variants={animationVariants}
          custom={0}
          initial="hidden"
          animate="visible"
          style={{
            y: y0,
          }}
        >
          <ColorfulMyName>{" I'm Qi "}</ColorfulMyName>, a software engineer
          based in Canada.
        </IntroductionTitle>
        <IntroductionSubtitle
          variants={animationVariants}
          custom={1}
          initial="hidden"
          animate="visible"
          style={{
            y: y1,
            marginTop: "2rem",
          }}
        >
          I specialize in full-stack development.
        </IntroductionSubtitle>
      </>
    </>
  );
};
