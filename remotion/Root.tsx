import { Composition, registerRoot } from "remotion";
import { LogoTemplate } from "./templates/LogoTemplate";

export const RemotionRoot: React.FC = () => {
  return (
    <>
      <Composition
        id="LogoTemplate"
        component={LogoTemplate}
        durationInFrames={150}
        fps={30}
        width={1080}
        height={1920}
        defaultProps={{
          logoUrl: "https://remotion-assets.s3.eu-central-1.amazonaws.com/logo-8gR8z.png",
        }}
      />
    </>
  );
};

registerRoot(RemotionRoot);
