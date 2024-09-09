import { Text, Button, Card, Image } from '@mantine/core';
import { useRouter } from 'next/router';

import {
  CoreState,
  isAuthenticated,
  selectUserAuthStatus,
  useCoreSelector,
} from '@gen3/core';
import { usePathname } from 'next/navigation';

interface HomepageCardProps {
  icon: string;
  title: string;
  description: string;
  href: string;
}

const ProjectCard = ({ title, description, icon, href }: HomepageCardProps) => {
  const userStatus = useCoreSelector((state: CoreState) =>
    selectUserAuthStatus(state),
  );
  const authenticated = isAuthenticated(userStatus);

  const router = useRouter();
  const pathname = usePathname();
  const handleButtonClick = () => {
    authenticated ? router.push(href) : router.push(`/Login?redirect=${pathname}`);
  };

  return (
    <Card className="shadow-lg p-6 text-left flex-1 basis-[20%] m-[13%]">
      <div className="flex items-left space-x-4 p-3">
        <div className="w-1/5">
          <Image className="w-1/2" src={icon} alt={`${title} logo`} />
        </div>
        <Text className="text-2xl text-left font-bold">{title}</Text>
      </div>
      <Text className="p-5 text-left">{description}</Text>
      <div className="pb-5">
        <Button
          onClick={handleButtonClick}
          className="py-3 w-full h-1/6 !bg-cbds-secondary hover:!bg-cbds-monosecondary text-white text-lg"
        >
          Overview
        </Button>
      </div>
    </Card>
  );
};

export default ProjectCard;
