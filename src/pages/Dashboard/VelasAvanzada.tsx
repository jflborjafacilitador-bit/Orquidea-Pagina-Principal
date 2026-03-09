import { VideoCategoria } from './VideoCategoria';

interface Props { userProfile: any; }

export const VelasAvanzada = ({ userProfile }: Props) => (
    <VideoCategoria
        category="velas_avanzada"
        categoryLabel="🕯️ Velas Avanzada"
        userProfile={userProfile}
        hasLevels={true}
    />
);
