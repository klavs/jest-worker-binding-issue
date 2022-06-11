export const work = async (id: string): Promise<[string, string]> => {
  await new Promise((resolve) => setTimeout(resolve, 100));

  return [id, process.env.JEST_WORKER_ID as string];
};
