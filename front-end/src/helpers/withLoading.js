export async function withLoading(functionToExecute, setLoading) {
  setLoading(true);
  try {
    return await functionToExecute();
  } catch (error) {
    console.error(error);
  } finally {
    setLoading(false);
  }
}
