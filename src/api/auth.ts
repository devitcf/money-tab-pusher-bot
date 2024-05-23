export const renewToken = async (refreshToken: string): Promise<{ accessToken: string; refreshToken: string }> => {
  const url = "https://api.money-tab.com/api/user_auth/refresh";
  const res = await fetch(url, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ refreshToken, user_type: "student" }),
  });
  const jsonRes = await res.json();
  return { accessToken: jsonRes.access_token, refreshToken: jsonRes.refresh_token };
};
