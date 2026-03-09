import { VideoCategoria } from './VideoCategoria';

interface Props { userProfile: any; }

export const MarketingDigital = ({ userProfile }: Props) => (
    <VideoCategoria
        category="marketing_digital"
        categoryLabel="📱 Marketing Digital"
        userProfile={userProfile}
        hasLevels={false}
    />
);
