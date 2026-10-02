---
title: "Работа с AVAudioPlayer и MPNowPlayingInfo (iOS)"
description: "В ходе разработки приложений под iOS часто возникает необходимость проиграть аудио-файл, например композицию или эффект."
date: 2016-01-18T23:11:00+03:00
tags: ["ios", "xamarin", "csharp", "avfoundation", "mediaplayer"]
lang: ru
kind: article
originalUrl: "https://bibobo.ru/all/rabota-s-avaudioplayer-i-mpnowplayinginfo-ios/"
---
В ходе разработки приложений под iOS часто возникает необходимость проиграть аудио-файл, например композицию или эффект. Наиболее простым способом для этого в iOS является использование класса AVAudioPlayer. Он является частью фреймворка AVFoundation, так что нам потребуется поставить на него using.

Ниже представлен код хэлпера, упрощающего работу с этим классом.

```csharp
/// <summary>
/// Хэлпер, упрощающий работу с плейером (в системе всегда висит один статический плейер)
/// </summary>
public static class PlayerHelper
{
    /// <summary>
    /// Состояние плейера
    /// </summary>
    public enum PlayerState
    {
        Uncknown,
        Playing,
        Stopped,
        Paused
    }

    /// <summary>
    /// Состояние плейера
    /// </summary>
    /// <value>The state.</value>
    public static PlayerState State { get; private set; }

    private static AVAudioPlayer _player;
    public static AVAudioPlayer Player { get{ return _player; } }

    /// <summary>
    /// Включена или нет функция зацикливания
    /// </summary>
    /// <value><c>true</c> if is infinite playing; otherwise, <c>false</c>.</value>
    public static bool IsInfinitePlaying
    {
        get{ return _player != null ? _player.NumberOfLoops == int.MaxValue : false; }
        set
        {
            if (_player == null)
            {
                return;
            }

            _player.NumberOfLoops = value ? int.MaxValue : 0;
        }
    }

    static PlayerHelper()
    {
        State = PlayerState.Uncknown;
    }

    /// <summary>
    /// Проиграть URL с диска (если он уже проигрывается, воспроизведение продолжится с места остановки)
    /// </summary>
    /// <returns>The URL.</returns>
    /// <param name="url">URL.</param>
    /// <param name="finishedPlayingAction">Finished playing action.</param>
    public static AVAudioPlayer PlayUrl(NSUrl url, Action finishedPlayingAction = null)
    {
        //в тех случаях, когда плейер уже проигрывает переданный url - не нужно останавливать запись или начинать сначала
        if (IsPlayerLoadedThisFile(url))
        {
            ResumePlaying();
            return _player;
        }

        StopPlaying();

        _player = AVAudioPlayer.FromUrl(url);
        _player.CurrentTime = 0;
        _player.Volume = 1f;

        if (finishedPlayingAction != null)
        {
            _player.FinishedPlaying += (sender, e) =>
            {
                finishedPlayingAction.Invoke();
            };
        }

        _player.PrepareToPlay();

        //разрешаем проигрывание в бекграунде
        AVAudioSession.SharedInstance().SetCategory(AVAudioSessionCategory.Playback);
        AVAudioSession.SharedInstance().SetActive(true);
        UIApplication.SharedApplication.BeginReceivingRemoteControlEvents();

        _player.Play();

        State = PlayerState.Playing;

        return _player;
    }

    /// <summary>
    /// Проиграть
    /// </summary>
    public static void Play()
    {
        if (_player == null)
        {
            return;
        }

        _player.Play();
        State = PlayerState.Playing;
    }

    /// <summary>
    /// Остановить
    /// </summary>
    public static void StopPlaying()
    {
        if (_player == null)
        {
            return;
        }

        _player.Stop();
        State = PlayerState.Stopped;
    }

    /// <summary>
    /// Приостановить
    /// </summary>
    public static void PausePlaying()
    {
        if (_player == null)
        {
            return;
        }

        _player.Pause();
        State = PlayerState.Paused;
    }

    /// <summary>
    /// Продолжить
    /// </summary>
    public static void ResumePlaying()
    {
        if (_player == null)
        {
            return;
        }

        _player.Play();
        State = PlayerState.Playing;
    }

    /// <summary>
    /// Возвратит true, если плейер загрузил файл по этому URL с диска
    /// </summary>
    /// <returns><c>true</c> if is player loaded this file the specified url; otherwise, <c>false</c>.</returns>
    /// <param name="url">URL.</param>
    public static bool IsPlayerLoadedThisFile(NSUrl url)
    {
        if (_player == null)
        {
            return false;
        }

        return _player.Url.LastPathComponent == url.LastPathComponent;
    }
}
```

Так же при проигрывании композиции (если в info.plist прописано разрешение на проигрывание аудио в бекграунде) на главном экране отображается информация о композиции, а так же кнопки управления воспроизведением. Чтобы информация отображалась корректно необходимо при старте проигрывания трека написать следующий код:

```csharp
MPNowPlayingInfo info = new MPNowPlayingInfo();
info.Title = "Имя композиции";
info.Artist = "наименование артиста";

info.PlaybackRate = 1f;
info.PlaybackDuration = PlayerHelper.Player.Duration;
info.ElapsedPlaybackTime = PlayerHelper.Player.CurrentTime;

MPNowPlayingInfoCenter.DefaultCenter.NowPlaying = info;
```
