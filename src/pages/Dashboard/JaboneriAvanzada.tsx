import { VideoCategoria } from './VideoCategoria';

interface Props { userProfile: any; }

export const JaboneriAvanzada = ({ userProfile }: Props) => (
    <VideoCategoria
        category="jaboneria_avanzada"
        categoryLabel="🧼 Jabonería Avanzada"
        userProfile={userProfile}
        hasLevels={true}
    />
);
