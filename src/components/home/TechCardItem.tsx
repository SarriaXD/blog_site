import styled from "styled-components";
import { useRef } from "react";
interface Props {
  imageUrl: string;
  title: string;
  description: string;
  backgroundColor: string;
}

const CardWrapper = styled.div`
  perspective: 1200px;
  background-color: transparent;
`;

const CardContainer = styled.div<{ backgroundColor: string }>`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  border-radius: 10px;
  background-color: ${(props) => props.backgroundColor};
  box-shadow: 0 4px 4px rgba(0, 0, 0, 0.25);
`;

const Image = styled.img`
  width: 100%;
  height: 200px;
  object-fit: contain;
`;

const BottomContainer = styled.div`
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  gap: 1rem;
  padding: 2.5rem;
  text-align: center;
`;

export const TechCardItem = ({
  imageUrl,
  title,
  description,
  backgroundColor,
}: Props) => {
  const ref = useRef<HTMLDivElement>(null);
  // const x = useMotionValue(0);
  // const y = useMotionValue(0);
  //
  // const rotateX = useTransform(y, [-1, 1], [10, -10]);
  // const rotateY = useTransform(x, [-1, 1], [-10, 10]);
  // const transitionX = useTransform(x, [-1, 1], [-30, 30]);
  // const transitionY = useTransform(y, [-1, 1], [-30, 30]);
  //
  // const xSpring = useSpring(transitionX, { stiffness: 120, damping: 17 });
  // const ySpring = useSpring(transitionY, { stiffness: 120, damping: 17 });
  // const rotationXSpring = useSpring(rotateX, { stiffness: 120, damping: 17 });
  // const rotationYSpring = useSpring(rotateY, { stiffness: 120, damping: 17 });

  // const handleMouseMove = (event: React.MouseEvent<HTMLDivElement>) => {
  // if (!ref.current) return;
  // const rect = ref.current.getBoundingClientRect();
  // const mouseX = event.clientX - rect.left;
  // const mouseY = event.clientY - rect.top;
  // const centerX = rect.width / 2;
  // const centerY = rect.height / 2;
  // x.set((mouseX - centerX) / centerX);
  // y.set((mouseY - centerY) / centerY);
  // };

  return (
    <>
      <CardWrapper>
        <CardContainer ref={ref} backgroundColor={backgroundColor}>
          <Image src={imageUrl} alt={title} />
          <BottomContainer>
            <h2>{title}</h2>
            <p>{description}</p>
          </BottomContainer>
        </CardContainer>
      </CardWrapper>
    </>
  );
};
