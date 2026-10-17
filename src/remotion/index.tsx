import { Composition, registerRoot } from "remotion";
import { Teaser } from "./Teaser";

export const RemotionRoot: React.FC = () => {
  return (
    <Composition
      id="Teaser"
      component={Teaser}
      durationInFrames={360}
      fps={30}
      width={1920}
      height={1080}
    />
  );
};

registerRoot(RemotionRoot);
