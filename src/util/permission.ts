import {PERMISSIONS, RESULTS, check, request} from 'react-native-permissions';

export const checkCameraPermission = async () => {
  const cameraPermissionStatus = await check(PERMISSIONS.IOS.CAMERA);
  if (cameraPermissionStatus === RESULTS.GRANTED) {
  } else {
    const result = await request(PERMISSIONS.IOS.CAMERA);
  }
  //Android permissions
  const cameraPermissionStatusAndroid = await check(PERMISSIONS.ANDROID.CAMERA);
  if (cameraPermissionStatusAndroid === RESULTS.GRANTED) {
  } else {
    const result = await request(PERMISSIONS.ANDROID.CAMERA);
  }
  // Photo Lib permissions
  const photoLibPermissionStatus = await check(PERMISSIONS.IOS.PHOTO_LIBRARY);
  if (photoLibPermissionStatus === RESULTS.GRANTED) {
  } else {
    const result = await request(PERMISSIONS.IOS.PHOTO_LIBRARY);
  }
  //Android permissions
  const photoLibPermissionStatusAndroid = await check(
    PERMISSIONS.ANDROID.READ_EXTERNAL_STORAGE,
  );
  if (photoLibPermissionStatusAndroid === RESULTS.GRANTED) {
  } else {
    const result = await request(PERMISSIONS.ANDROID.READ_EXTERNAL_STORAGE);
  }
};
