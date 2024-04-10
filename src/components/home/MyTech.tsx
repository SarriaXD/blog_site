import styled from "styled-components";
import { TechCardItem } from "./TechCardItem.tsx";
import useScrollDir, { Direction } from "../../util/useScrollDir.ts";

const MyTechStackText = styled.h1<{ show: boolean }>`
  color: white;
  font-size: 3rem;
  text-align: center;
  line-height: 1.5;
  margin: 0 2.5rem;
  opacity: ${(props) => (props.show ? 1 : 0)};
  transform: ${(props) => (props.show ? "translateY(-8rem)" : "none")};
  transition:
    transform 1s,
    opacity 1s;
`;

const TechListContainer = styled.div`
  display: flex;
  flex-wrap: wrap;
  justify-content: space-evenly;
  align-items: flex-start;
  gap: 2rem;

  div {
    flex: 0 0 90%;
  }

  @media (min-width: 600px) {
    margin: 0 2rem;
    div {
      flex: 0 0 40%;
    }
  }

  @media (min-width: 900px) {
    margin: 0 2rem;
    div {
      flex: 0 0 30%;
    }
  }

  @media (min-width: 1200px) {
    margin: 0 2rem;
    div {
      flex: 0 0 20%;
    }
  }
`;

const techList: {
  imageUrl: string;
  title: string;
  description: string;
}[] = [
  {
    imageUrl: "tech/react.png",
    title: "React",
    description: "A JavaScript library for building user interfaces.",
  },
  {
    imageUrl: "tech/flutter.png",
    title: "Flutter",
    description:
      "An open-source UI software development kit created by Google.",
  },
  {
    imageUrl: "tech/jetpack_compose.png",
    title: "Jetpack Compose",
    description: "A modern UI toolkit for Android development.",
  },
  {
    imageUrl: "tech/android.png",
    title: "Android",
    description: "A mobile operating system developed by Google.",
  },
  {
    imageUrl: "tech/spring_boot.png",
    title: "Spring Boot",
    description: "An open-source Java-based framework.",
  },
];

export function MyTech() {
  const scrollDir = useScrollDir({
    thr: 10,
  });
  return (
    <>
      <MyTechStackText show={scrollDir === Direction.Down}>
        My Tech Stack
      </MyTechStackText>
      <TechListContainer>
        {techList.map((tech, index) => (
          <TechCardItem
            imageUrl={tech.imageUrl}
            title={tech.title}
            description={tech.description}
            key={index}
            backgroundColor={"#222222"}
          />
        ))}
      </TechListContainer>
    </>
  );
}
