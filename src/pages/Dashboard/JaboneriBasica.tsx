import { VideoCategoria } from './VideoCategoria';

interface Props { userProfile: any; }

export const JaboneriBasica = ({ userProfile }: Props) => (
    <VideoCategoria
        category="jaboneria_basica"
        categoryLabel="🧼 Jabonería Básica"
        userProfile={userProfile}
        hasLevels={true}
    />
);
