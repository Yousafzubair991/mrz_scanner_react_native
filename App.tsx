import {Button, SafeAreaView, ScrollView, StyleSheet, Text} from 'react-native';
import {Camera, useCameraDevice} from 'react-native-vision-camera';
import React, {useCallback, useEffect, useRef, useState} from 'react';

import TextRecognition from '@react-native-ml-kit/text-recognition';
import {calculateChecksum} from './src/util/checksum';
import {checkCameraPermission} from './src/util/permission';
import {parse} from 'mrz';

function App(): JSX.Element {
  const device = useCameraDevice('back');
  const ref = useRef<Camera>(null);
  const [mrzText, setmrzText] = useState<string | null>(null);
  const [mrz, setmrz] = useState<string | null>(null);
  const [isCapturing, setIsCapturing] = useState<boolean>(false);
  const [hasPermission, setHasPermission] = useState<boolean>(false);
  const [message, setmessage] = useState<string | null>(null);

  // Stop capturing
  const stopCapturing = useCallback(() => {
    setIsCapturing(false);
  }, []);

  // Extract MRZ from image
  const extractMRZ = useCallback(
    async (imagePath: string): Promise<string | null> => {
      try {
        const result = await TextRecognition.recognize(imagePath);
        const mrzLines = [];
        const mrzPattern = /^[A-Z0-9<«]{30,44}$/;
        for (let block of result.blocks) {
          for (let line of block.lines) {
            const lineText = line.text.replace(/\s/g, '').replace(/«/g, '<'); // Normalize '«' to '<'
            if (mrzPattern.test(lineText)) {
              mrzLines.push(lineText);
            }
          }
        }
        if (mrzLines.length === 3 || mrzLines.length === 2) {
          return mrzLines.join('\n');
        } else {
          console.log('MRZ not found or incomplete. Found lines:', mrzLines);
          setmessage('❌ MRZ Not Found');
          return null;
        }
      } catch (error) {
        console.log('Error extracting MRZ:', error);
        setmessage('❌ Error Extracting');
        return null;
      }
    },
    [setmessage],
  );

  // Decode MRZ and validate checksums
  const decodeMRZ = useCallback(
    (mrzData: string) => {
      const mrzObject = parse(mrzData, {autocorrect: true})?.fields;

      if (mrzObject) {
        const isValid = calculateChecksum(
          mrzObject?.documentNumber,
          mrzObject?.documentNumberCheckDigit,
        );
        const isValidBirth = calculateChecksum(
          mrzObject?.birthDate,
          mrzObject?.birthDateCheckDigit,
        );
        const isValidExp = calculateChecksum(
          mrzObject?.expirationDate,
          mrzObject?.expirationDateCheckDigit,
        );
        if (!isValid || !isValidBirth || !isValidExp) {
          setmrzText(null);
          setmessage('❌ Invalid Checksum');
          return null;
        }
        setmrz(JSON.stringify(mrzData));
        setmrzText(JSON.stringify(mrzObject, null, 2));
        stopCapturing();
      }
    },
    [stopCapturing],
  );

  const startCapturing = useCallback(() => {
    // Check if camera device is available and permission is granted before starting
    if (!device) {
      setmessage('❌ Camera Device Not Available');
      stopCapturing();
      return;
    }

    if (!hasPermission) {
      setmessage('❌ Camera Permission Not Granted');
      return;
    }

    setmrzText(null);
    setmrz(null);
    setIsCapturing(true);
    let retryCount = 0;
    let previousMRZ: any = null;

    const captureAndValidate = async (): Promise<void> => {
      try {
        if (retryCount >= 10) {
          setmessage('❌ ID Capture Failed');
          stopCapturing();
          return;
        }

        if (ref.current && device) {
          setmessage('📷 Capturing photo');
          const photo = await ref.current.takePhoto({
            flash: 'off',
            enableShutterSound: false,
          });

          setmessage('Processing...');
          const currentMRZ = await extractMRZ('file://' + photo.path);

          if (!currentMRZ) {
            // if no mrz found capture again
            retryCount++;
            setmessage('Hold Your ID Steady');
            captureAndValidate();
          } else if (!previousMRZ) {
            // if no previous mrz set the current mrz
            previousMRZ = currentMRZ;
            setmessage('Hold Steady');
            captureAndValidate();
          } else if (previousMRZ && previousMRZ !== currentMRZ) {
            // if previous mrz is not equal to current mrz, set the current mrz
            retryCount++;
            previousMRZ = currentMRZ;
            captureAndValidate();
          } else {
            // if previous mrz is equal to current mrz, stop capturing and decode mrz
            setmessage('✅ Capture Success');
            decodeMRZ(currentMRZ);
            stopCapturing();
          }
        } else {
          setmessage('❌ Camera Not Ready');
        }
      } catch (error) {
        console.log('Error capturing image:', error);
        retryCount++;
        setmessage('❌ Error Occurred');
        captureAndValidate();
      }
    };

    // Start the capture process with a small delay to ensure camera is ready
    setTimeout(() => {
      captureAndValidate();
    }, 500);
  }, [
    decodeMRZ,
    stopCapturing,
    device,
    hasPermission,
    setmessage,
    extractMRZ,
    ref,
  ]);

  useEffect(() => {
    const initializeCamera = async () => {
      await checkCameraPermission();
      setHasPermission(true); // Assume permissions are granted after check
    };
    initializeCamera();
    return () => {};
  }, []);

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView
        contentInsetAdjustmentBehavior="automatic"
        style={styles.scrollView}>
        {isCapturing && device && hasPermission && (
          <Camera
            ref={ref}
            style={styles.camera}
            device={device}
            isActive={true}
            photo={true}
          />
        )}
        {mrz && <Text style={styles?.title}>MRZ Data:</Text>}
        <Text style={styles?.mrz}>{mrz}</Text>
        {mrzText && <Text style={styles?.title}>MRZ Text:</Text>}
        <Text style={styles?.mrz}>{mrzText}</Text>
        <Button
          title={isCapturing ? 'Stop Capturing' : 'Start Capturing'}
          onPress={isCapturing ? stopCapturing : startCapturing}
        />
        <Text style={styles?.message}>{message}</Text>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollView: {
    marginHorizontal: 20,
  },
  camera: {
    width: 300,
    height: 300,
    alignSelf: 'center',
    marginTop: 20,
    marginBottom: 50,
  },
  mrz: {
    fontSize: 20,
    color: 'black',
    marginTop: 20,
  },
  message: {
    fontSize: 16,
    color: 'red',
    marginTop: 20,
    alignSelf: 'center',
    textTransform: 'uppercase',
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
    color: 'black',
    marginTop: 20,
  },
});

export default App;
