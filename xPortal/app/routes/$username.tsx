import { Outlet } from '@remix-run/react';
import { json, LoaderFunction } from '@remix-run/node';
import { prisma } from '~/utils/prisma.server';

export const loader: LoaderFunction = async ({ params }) => {
  const { username } = params;

  if (!username) {
    return json({ error: 'Username is required' }, { status: 400 });
  }

  const user = await prisma.user.findUnique({
    where: { username },
    select: {
      id: true,
      username: true,
      profile: true,
    },
  });

  if (!user) {
    return json({ error: 'User not found' }, { status: 404 });
  }

  return json({ user });
};

export default function UserLayout() {
  return <Outlet />;
} 