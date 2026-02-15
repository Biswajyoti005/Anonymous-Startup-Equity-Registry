import { createFileRoute, redirect } from '@tanstack/react-router';

export const Route = createFileRoute('/counter')({
  beforeLoad: () => {
    throw redirect({ to: '/equity-registry' });
  },
  component: () => null,
});
