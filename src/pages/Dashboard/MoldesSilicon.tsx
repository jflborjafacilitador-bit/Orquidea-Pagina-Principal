import { VideoCategoria } from './VideoCategoria';

interface Props { userProfile: any; }

export const MoldesSilicon = ({ userProfile }: Props) => (
    <VideoCategoria
        category="moldes_silicon"
        categoryLabel="🧩 Moldes de Silicón"
        userProfile={userProfile}
        hasLevels={false}
    />
);
