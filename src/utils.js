export const errorLog = async (error) => {
    console.log(error);
}

export async function _processResponse(response) {
  const data = response.json();
  const statusCode = response.status;

  const res = await Promise.all([data, statusCode]);
  return ({
    data: res[0],
    statusCode: res[1]
  });
}