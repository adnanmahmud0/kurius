import '../../features/user/video_scroll/models/video_model.dart';

class VideoRepository {
  List<VideoModel> getAllVideos() {
    return const [
      VideoModel(
        id: 'hermes',
        title: 'Hermes: The Messenger of the Gods',
        category: 'Mythology',
        imageUrl:
            'https://images.unsplash.com/photo-1544816155-12df9643f363?q=80&w=800&auto=format&fit=crop',
        duration: '0:45',
        initialLikes: 3420,
        initialComments: 142,
        description:
            'Hermes is an Olympian deity in ancient Greek religion and mythology. Hermes is considered the herald of the gods.',
      ),
      VideoModel(
        id: 'kairos',
        title: 'Kairos: the god of the fleeting opportunity',
        category: 'Mythology',
        imageUrl:
            'https://images.unsplash.com/photo-1534447677768-be436bb09401?q=80&w=800&auto=format&fit=crop',
        duration: '1:12',
        initialLikes: 2190,
        initialComments: 98,
        description:
            'In ancient Greek mythology, Kairos represents the opportune or right critical moment.',
      ),
      VideoModel(
        id: 'pandora',
        title: "Pandora's Box",
        category: 'Mythology',
        imageUrl:
            'https://images.unsplash.com/photo-1518709268805-4e9042af9f23?q=80&w=800&auto=format&fit=crop',
        duration: '0:58',
        initialLikes: 4890,
        initialComments: 310,
        description:
            'Pandoras box is an artifact in Greek mythology connected with the myth of Pandora in Hesiods Works and Days.',
      ),
      VideoModel(
        id: 'neptune',
        title: 'Neptune: The God of the Sea',
        category: 'Mythology',
        imageUrl:
            'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?q=80&w=800&auto=format&fit=crop',
        duration: '1:24',
        initialLikes: 1850,
        initialComments: 76,
        description:
            'Neptune is the god of freshwater and the sea in Roman religion. He is the counterpart of the Greek god Poseidon.',
      ),
      VideoModel(
        id: 'athena',
        title: 'Athena: The Goddess of Wisdom',
        category: 'Mythology',
        imageUrl:
            'https://images.unsplash.com/photo-1568605117036-5fe5e7bab0b7?q=80&w=800&auto=format&fit=crop',
        duration: '1:05',
        initialLikes: 5600,
        initialComments: 420,
        description:
            'Athena is an ancient Greek goddess associated with wisdom, warfare, and handicraft.',
      ),
      VideoModel(
        id: 'cupid',
        title: 'Cupid: The Love That Changed All',
        category: 'Mythology',
        imageUrl:
            'https://images.unsplash.com/photo-1516589178581-6cd7833ae3b2?q=80&w=800&auto=format&fit=crop',
        duration: '0:48',
        initialLikes: 6730,
        initialComments: 512,
        description:
            'Cupid is the god of desire, erotic love, attraction and affection in classical mythology.',
      ),
      VideoModel(
        id: 'venus',
        title: 'Venus: The Goddess of Love & Beauty',
        category: 'Mythology',
        imageUrl:
            'https://images.unsplash.com/photo-1579783902614-a3fb3927b675?q=80&w=800&auto=format&fit=crop',
        duration: '1:15',
        initialLikes: 4120,
        initialComments: 230,
        description:
            'Venus is a Roman goddess, whose functions encompass love, beauty, desire, sex, fertility, and prosperity.',
      ),
      VideoModel(
        id: 'zeus',
        title: 'Zeus and the division of the world',
        category: 'Mythology',
        imageUrl:
            'https://images.unsplash.com/photo-1509198397868-475647b2a1e5?q=80&w=800&auto=format&fit=crop',
        duration: '1:40',
        initialLikes: 8920,
        initialComments: 640,
        description:
            'Zeus is the sky and thunder god in ancient Greek religion, who rules as king of the gods of Mount Olympus.',
      ),
    ];
  }
}
