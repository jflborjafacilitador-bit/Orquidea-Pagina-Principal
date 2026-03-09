import { VideoCategoria } from './VideoCategoria';

interface Props { userProfile: any; }

export const VelasBasica = ({ userProfile }: Props) => (
    <VideoCategoria
        category="velas_basica"
        categoryLabel="🕯️ Velas Básica"
        userProfile={userProfile}
        hasLevels={true}
    />
);
