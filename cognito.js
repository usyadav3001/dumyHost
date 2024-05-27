// document.getElementById('loginButton').addEventListener('click', loginWithGoogle);
// document.getElementById('fetchButton').addEventListener('click', fetchS3BucketContents);

// const clientId = '2hbfg79vqnhqf9bkhuc7nlq1n3';
// const domain = 'wfxgoogle';
// const redirectUri = 'https://worldfashionexchange.com';
// const region = 'ap-south-1';
// const identityPoolId = 'ap-south-1:e180bc55-724d-4124-8f90-aebb92f21d30';
// const bucketName = 'wfxplmcontent-qa';

// const cognitoOauthUrl = `https://${domain}.auth.${region}.amazoncognito.com/oauth2/authorize?client_id=${clientId}&response_type=code&scope=email+openid+profile&redirect_uri=${redirectUri}`;
// function loginWithGoogle() {
//   window.location.href = cognitoOauthUrl;
// }

// async function handleAuthResponse() {
//   const urlParams = new URLSearchParams(window.location.search);
//   console.log("urlParams",urlParams);
//   const code = urlParams.get('code');
// console.log("code",code);
//   if (code) {
//     const tokenUrl = `https://${domain}.auth.${region}.amazoncognito.com/oauth2/token`;
//     const data = {
//       grant_type: 'authorization_code',
//       client_id: clientId,
//       redirect_uri: redirectUri,
//       code: code
//     };
//     console.log("data",data);
//     const response = await fetch(tokenUrl, {
//       method: 'POST',
//       headers: {
//         'Content-Type': 'application/x-www-form-urlencoded'
//       },
//       body: new URLSearchParams(data)
//     });

//     const tokens = await response.json();
//     if (tokens.access_token) {
//       localStorage.setItem('access_token', tokens.access_token);
//       localStorage.setItem('refresh_token', tokens.refresh_token);
//       document.getElementById('fetchButton').style.display = 'block';
//     } else {
//       console.error('Failed to get tokens:', tokens);
//     }
//   }
// }

// async function fetchS3BucketContents() {
//   const accessToken = localStorage.getItem('access_token');

//   if (!accessToken) {
//     console.error('User not authenticated');
//     return;
//   }

//   AWS.config.region = region;

//   AWS.config.credentials = new AWS.CognitoIdentityCredentials({
//     IdentityPoolId: identityPoolId,
//     Logins: {
//       [`cognito-idp.${region}.amazonaws.com/${domain}`]: accessToken
//     }
//   });

//   await AWS.config.credentials.getPromise();

//   const s3 = new AWS.S3();

//   const params = {
//     Bucket: bucketName
//   };

//   s3.listObjectsV2(params, (err, data) => {
//     if (err) {
//       console.error('Error fetching S3 bucket contents:', err);
//     } else {
//       const s3List = document.getElementById('s3List');
//       s3List.innerHTML = '';
//       data.Contents.forEach(item => {
//         const listItem = document.createElement('tr');
//         listItem.innerHTML = `
//           <td>${item.Key}</td>
//           <td>${item.Size}</td>
//           <td>${item.LastModified}</td>
//         `;
//         s3List.appendChild(listItem);
//       });
//       document.getElementById('s3Contents').style.display = 'block';
//     }
//   });
// }
// document.addEventListener('DOMContentLoaded', handleAuthResponse);

document.addEventListener('DOMContentLoaded', function() {
const clientId = '2hbfg79vqnhqf9bkhuc7nlq1n3';
const domain = 'wfxgoogle';
const redirectUri = 'https://jwt.io';
const region = 'ap-south-1';
const identityPoolId = 'ap-south-1:e180bc55-724d-4124-8f90-aebb92f21d30';
const bucketName = 'wfxplmcontent-qa';

const cognitoOauthUrl = `https://${domain}.auth.${region}.amazoncognito.com/oauth2/authorize?client_id=${clientId}&response_type=code&scope=email+openid+profile&redirect_uri=${redirectUri}`;
document.getElementById('loginButton').addEventListener('click', function() {
    window.location.href = cognitoOauthUrl;
  });

  async function handleAuthResponse() {
    const urlParams = new URLSearchParams(window.location.search);
    const code = urlParams.get('code');
console.log("huuu",code)
    if (!code) {
      console.error('Authorization code not found in the URL.');
      return;
    }

    const tokenUrl = `https://${domain}.auth.${region}.amazoncognito.com/oauth2/token`;
    const data = {
      grant_type: 'authorization_code',
      client_id: clientId,
      redirect_uri: redirectUri,
      code: code
    };

    try {
      const response = await fetch(tokenUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded'
        },
        body: new URLSearchParams(data)
      });

      const tokens = await response.json();
      if (tokens.access_token) {
        localStorage.setItem('access_token', tokens.access_token);
        localStorage.setItem('refresh_token', tokens.refresh_token);
        document.getElementById('fetchButton').style.display = 'block';
      } else {
        console.error('Failed to get tokens:', tokens);
      }
    } catch (error) {
      console.error('Error fetching tokens:', error);
    }
  }

  async function fetchS3BucketContents() {
    const accessToken = localStorage.getItem('access_token');

    if (!accessToken) {
      console.error('User not authenticated');
      return;
    }

    AWS.config.region = region;
    AWS.config.credentials = new AWS.CognitoIdentityCredentials({
      IdentityPoolId: identityPoolId,
      Logins: {
        [`cognito-idp.${region}.amazonaws.com/${domain}`]: accessToken
      }
    });

    await AWS.config.credentials.getPromise();

    const s3 = new AWS.S3();
    const params = {
      Bucket: bucketName
    };

    s3.listObjectsV2(params, (err, data) => {
      if (err) {
        console.error('Error fetching S3 bucket contents:', err);
      } else {
        const s3List = document.getElementById('s3List');
        s3List.innerHTML = '';
        data.Contents.forEach(item => {
          const listItem = document.createElement('tr');
          listItem.innerHTML = `
            <td>${item.Key}</td>
            <td>${item.Size}</td>
            <td>${item.LastModified}</td>
          `;
          s3List.appendChild(listItem);
        });
        document.getElementById('s3Contents').style.display = 'block';
      }
    });
  }

  document.getElementById('fetchButton').addEventListener('click', fetchS3BucketContents);

  // Retry logic to handle delay in receiving the code
  const checkAuthResponse = setInterval(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const code = urlParams.get('code');

    if (code) {
      clearInterval(checkAuthResponse);
      handleAuthResponse();
    }
  }, 500);
})
