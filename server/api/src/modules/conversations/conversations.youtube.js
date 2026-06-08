import play from 'play-dl';
const validateYoutubeUrl = async (sourceLink) => {
  try {
    const metadata = await play.video_basic_info(sourceLink);

    return {
      isValid: true,
      title: metadata.video_details.title,
      //   duration: metadata.video_details.durationInSec,
    };
  } catch {
    return {
      isValid: false,
      errorMessage: 'Invalid, private, or unavailable YouTube video',
    };
  }
};

export { validateYoutubeUrl };
