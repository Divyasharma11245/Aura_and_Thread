export const verificationOTPTemplate = (name, OTP) => {
  return `
  <!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>verifyEmail</title>
    <style>
        body{
            text-align: center;
            display:flex;
            flex-direction: column;
            justify-content: center;
            align-items: center;
            font-size: 1.2rem;
        }
        #heading{
            margin: 2rem 0 2rem 0;
            padding:2rem;
        }
        #box{
            height: 20rem;
            width: 35rem;
            margin:1rem 2rem;
            border: 2px solid black;
            border-radius: 15px;
            padding: 1.5rem;
            text-align: start;
        }
    </style>
</head>
<body>
    <h3 id="heading">Please verify your identity, ${name}</h3>
    <div id="box">
        <h4>Here is your OTP for verification:</h4>
        <h2 style="text-align: center;">${OTP}</h2>
        <p>This code is valid for <b>10 minutes</b> and can only be used once.<br>
        <b>Please don't share this code with anyone,<br> we w'll never ask for it on the phone or via email.</b></p>
        <p>Thanks,</p>
        <h4>The Aura and Thread Team</h4>
    </div>
    <p>You're receiving this email because a verification code was requested for your account. <br>
    If this wasn't you, please ignore this email.</p>
</body>
</html>
    `;
};
