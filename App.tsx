/**
 * Sample React Native App
 * https://github.com/facebook/react-native
 *
 * @format
 */

import {Button, SafeAreaView, ScrollView, StyleSheet, Text} from 'react-native';
import {Camera, useCameraDevice} from 'react-native-vision-camera';
import React, {useCallback, useEffect, useRef, useState} from 'react';

import TextRecognition from '@react-native-ml-kit/text-recognition';
import {checkCameraPermission} from './src/util/permission';
import {parse} from 'mrz';

function App(): JSX.Element {
  const device = useCameraDevice('back');
  const ref = useRef<Camera>(null);
  const [mrzText, setmrzText] = useState(null);
  const [mrz, setmrz] = useState(null);
  const [isCapturing, setIsCapturing] = useState(false);
  const [intervalId, setIntervalId] = useState(null);

  const stopCapturing = useCallback(() => {
    setIsCapturing(false);
    if (intervalId) {
      clearInterval(intervalId);
      setIntervalId(null);
    }
  }, [intervalId]);

  const extractMRZ = useCallback(
    async (imagePath: string) => {
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
          const mrzObject = parse(mrzLines.join('\n'), {
            autocorrect: true,
          })?.fields;
          if (mrzObject) {
            console.log('MRZ:', mrzObject);
            setmrz(mrzLines.join('\n'));
            setmrzText(JSON.stringify(mrzObject, null, 2));
            stopCapturing();
            return mrzObject;
          } else {
            console.log('MRZ not found or incomplete. Found lines:', mrzLines);
            setmrzText(null);
            return null;
          }
        } else {
          console.log('MRZ not found or incomplete. Found lines:', mrzLines);
          setmrzText(null);
          return null;
        }
      } catch (error) {
        return null;
      }
    },
    [setmrz, setmrzText, stopCapturing],
  );

  const startCapturing = useCallback(() => {
    setmrzText(null);
    setmrz(null);
    setIsCapturing(true);
    const id = setInterval(async () => {
      if (ref.current) {
        try {
          const photo = await ref.current.takePhoto({
            flash: 'off',
            enableShutterSound: false,
          });
          extractMRZ('file://' + photo.path);
        } catch (error) {
          console.error('Error capturing image:', error);
        }
      }
    }, 2500);
    setIntervalId(id);
  }, [extractMRZ, ref]);

  useEffect(() => {
    checkCameraPermission();
    return () => {};
  }, []);

  return (
    <SafeAreaView style={{flex: 1}}>
      <ScrollView
        contentInsetAdjustmentBehavior="automatic"
        style={styles.scrollView}>
        {isCapturing && device && (
          <Camera
            ref={ref}
            style={styles.camera}
            device={device}
            isActive={true}
            photo={true}
          />
        )}
        <Text style={styles?.mrz}>{mrz}</Text>
        <Text style={styles?.mrz}>{mrzText}</Text>

        <Button
          title={isCapturing ? 'Stop Capturing' : 'Start Capturing'}
          onPress={isCapturing ? stopCapturing : startCapturing}
        />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
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
});

export default App;
