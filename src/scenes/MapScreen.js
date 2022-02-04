/**
 * Sample React Native App
 * https://github.com/facebook/react-native
 *
 * @format
 * @flow strict-local
 */

import React, {useState, useEffect, useRef, useMemo} from 'react';
import {
  SafeAreaView,
  StyleSheet,
  ScrollView,
  View,
  Text,
  Dimensions,
  ActivityIndicator,
  Image,
  ImageBackground,
  TouchableOpacity,
  Button,
} from 'react-native';

import NaverMapView, {
  Circle,
  Marker,
  Path,
  Polyline,
  Polygon,
} from 'react-native-nmap';
import {FloatingAction} from 'react-native-floating-action';
import Icon from 'react-native-vector-icons/Ionicons';
import {AddTrashcan} from '../components/AddTrashcan';
import data from '../../dummy/data.json';
import {TrashcanInfo} from '../components/TrashcanInfo';
import {Auth} from '../components/Auth';
import {Alert} from '../components/Alert';
import {LeaderBoard} from '../components/LeaderBoard';
import {BottomSheetComponent} from '../components/BottomSheetComponent';
import {
  usePinState,
  usePinDispatch,
  getPin,
  PinContext,
} from '../context/PinContext';
import {
  useUserState,
  useUserDispatch,
  getUser,
  UserContext,
} from '../context/UserContext';

import {FloatingButton} from '../components/FloatingButton';
import {BottomSheetModal, BottomSheetModalProvider} from '@gorhom/bottom-sheet';

import {getData} from '../service/AsyncStorage';
import {URL} from '../../env.json';

export const MapScreen = ({latitude, longitude}) => {
  const [modalVisible, setModalVisible] = useState(false);
  const [infoModalVisible, setInfoModalVisible] = useState(false);
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [selectedId, setSelectedId] = useState(null);
  const [authModalVisible, setAuthModalVisible] = useState(false);
  const [alertVisible, setAlertVisible] = useState(false);
  const [leaderBoardVisible, setLeaderBoardVisible] = useState(false);
  const [loadingVisible, setLoadingVisible] = useState(false);
  const [likes, setLikes] = useState(0);
  const [dislikes, setDisLikes] = useState(0);

  const userState = useUserState();
  const userDispatch = useUserDispatch();
  const {user} = userState; // included : data, loading, error, success

  const pinState = usePinState();
  const pinDispatch = usePinDispatch();
  const {pin} = pinState; // included : data, loading, error, success

  const bottomSheetModalRef = useRef<Modalize>(null);
  const authBottomSheetModalRef = useRef<Modalize>(null);
  const addBottomSheetModalRef = useRef<Modalize>(null);
  const leaderBoardBottomSheetModalRef = useRef<Modalize>(null);

  const trashcanSnapPoints = useMemo(() => ['40%', '70%'], []);
  const authSnapPoints = useMemo(() => ['30%', '70%'], []);
  const addSnapPoints = useMemo(() => ['100%'], []);
  const leaderBoardSnapPoints = useMemo(() => ['100%'], []);

  const onClicked = (point, idx) => {
    console.log('clicked', point, idx);
    setSelectedIndex(idx);
    setSelectedId(point.id);
    setInfoModalVisible(true);
  };

  const menuPressed = async (name) => {
    const userData = await getData('user');
    if (name === 'login') {
      setAuthModalVisible(true);
      authBottomSheetModalRef.current?.present();
    } else if (name === 'addTrashcan') {
      if (userData === null) {
        setAlertVisible(true);
      } else {
        setModalVisible(true);
        addBottomSheetModalRef.current?.present();
        console.log('addBottomSheetModalRef', addBottomSheetModalRef);
      }
    } else if (name === 'leaderBoard') {
      setLeaderBoardVisible(true);
      leaderBoardBottomSheetModalRef.current?.present();
    }
  };

  useEffect(() => {
    setSelectedIndex(null);
  }, []);

  return (
    <>
      <BottomSheetModalProvider>
        <NaverMapView
          style={{width: '100%', height: '100%'}}
          showsMyLocationButton={true}
          setLocationTrackingMode={2}
          center={{latitude: latitude, longitude: longitude, zoom: 16}}
          //onTouch={e => console.warn('onTouch', JSON.stringify(e.nativeEvent))}
          //onCameraChange={e => console.log('onCameraChange', JSON.stringify(e))}

          //onMapClick={e => console.warn('onMapClick', JSON.stringify(e))}
        >
          {pin.data &&
            pin.data.map((point, idx) =>
              Platform.OS === 'ios' ? (
                <Marker
                  key={idx}
                  coordinate={point}
                  pinColor={
                    pin.data[idx].likes - pin.data[idx].dislikes > 1
                      ? 'blue'
                      : pin.data[idx].likes - pin.data[idx].dislikes < -1
                      ? 'red'
                      : null
                  }
                  onClick={async () => {
                    await onClicked(point, idx);
                    bottomSheetModalRef.current?.present();
                  }}
                />
              ) : (
                <Marker
                  key={idx}
                  coordinate={point}
                  width={60}
                  height={60}
                  onClick={async () => {
                    await onClicked(point, idx);
                    bottomSheetModalRef.current?.present();
                  }}>
                  <View style={{flexDirection: 'row'}}>
                    {pin.data[idx].likes - pin.data[idx].dislikes > 1 ? (
                      <Image
                        source={require('../assets/marker/marker_green.png')}
                        style={{width: 60, height: 60}}
                        fadeDuration={0}
                      />
                    ) : pin.data[idx].likes - pin.data[idx].dislikes < -1 ? (
                      <Image
                        source={require('../assets/marker/marker_red.png')}
                        style={{width: 60, height: 60}}
                        fadeDuration={0}
                      />
                    ) : (
                      <Image
                        source={require('../assets/marker/marker_gray.png')}
                        style={{width: 60, height: 60}}
                        fadeDuration={0}
                      />
                    )}
                  </View>
                </Marker>
              ),
            )}
        </NaverMapView>

        {infoModalVisible && selectedIndex !== null ? (
          <BottomSheetModal
            ref={bottomSheetModalRef}
            snapPoints={trashcanSnapPoints}
            onDismiss={() => {
              if (authModalVisible) {
                setAuthModalVisible(false);
              }
              setInfoModalVisible(false);
              setSelectedIndex(null);
              setSelectedId(null);
              // console.log(`this is trashcanLocation`, selectedTrashcan);
              //addNewTrashcan()
            }}
            backgroundComponent={(props) => (
              <BottomSheetBackground {...props} />
            )}>
            <TrashcanInfo
              modalVisible={infoModalVisible}
              setModalVisible={setInfoModalVisible}
              selectedIndex={selectedIndex}
              setSelectedIndex={setSelectedIndex}
              selectedId={selectedId}
              setSelectedId={setSelectedId}
              alertVisible={alertVisible}
              setAlertVisible={setAlertVisible}
              loadingVisible={loadingVisible}
              setLoadingVisible={setLoadingVisible}
              bottomSheetModalRef={bottomSheetModalRef}
            />
          </BottomSheetModal>
        ) : authModalVisible ? (
          <BottomSheetModal
            ref={authBottomSheetModalRef}
            snapPoints={authSnapPoints}
            onDismiss={() => {
              setAuthModalVisible(false);
              // console.log(`this is trashcanLocation`, selectedTrashcan);
              //addNewTrashcan()
            }}
            backgroundComponent={(props) => (
              <BottomSheetBackground {...props} />
            )}>
            <Auth
              authModalVisible={authModalVisible}
              setAuthModalVisible={setAuthModalVisible}
            />
          </BottomSheetModal>
        ) : modalVisible ? (
          <BottomSheetModal
            ref={addBottomSheetModalRef}
            snapPoints={addSnapPoints}
            onDismiss={() => {
              setModalVisible(false);
              // console.log(`this is trashcanLocation`, selectedTrashcan);
              //addNewTrashcan()
            }}>
            <AddTrashcan
              modalVisible={modalVisible}
              setModalVisible={setModalVisible}
              loadingVisible={loadingVisible}
              setLoadingVisible={setLoadingVisible}
              addBottomSheetModalRef={addBottomSheetModalRef}
            />
          </BottomSheetModal>
        ) : leaderBoardVisible ? (
          <BottomSheetModal
            ref={leaderBoardBottomSheetModalRef}
            snapPoints={leaderBoardSnapPoints}
            onDismiss={() => {
              setLeaderBoardVisible(false);
            }}>
            <LeaderBoard
              leaderBoardVisible={leaderBoardVisible}
              setLeaderBoardVisible={setLeaderBoardVisible}
              loadingVisible={loadingVisible}
              setLoadingVisible={setLoadingVisible}
            />
          </BottomSheetModal>
        ) : (
          <FloatingButton
            onPressItem={(name) => {
              menuPressed(name);
            }}
          />
        )}
        <Alert
          alertVisible={alertVisible}
          setAlertVisible={setAlertVisible}
          message={'로그인을 먼저 해주세요!'}
          confirmText={'확인'}
        />
      </BottomSheetModalProvider>
    </>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'flex-end',
  },
});

const BottomSheetBackground = ({style}) => {
  return (
    <View
      style={[
        {
          backgroundColor: 'white',
          borderRadius: 30,
        },
        {...style},
      ]}
    />
  );
};
