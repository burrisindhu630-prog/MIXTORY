import { CreativeCategory } from '../types';

export interface CategoryAsset {
  category: CreativeCategory;
  name: string;
  image: string;
  tagline: string;
  description: string;
}

export const CATEGORY_ASSETS: Record<CreativeCategory, CategoryAsset> = {
  Music: {
    category: 'Music',
    name: 'Music & Production',
    image: '/src/assets/images/creative_project_music_1793209901138.jpg',
    tagline: 'Instruments, Synthesizers & Recording Consoles',
    description: 'Hardware synthesis, multi-track arrangements, soundscapes, and mixing.'
  },
  Singing: {
    category: 'Singing',
    name: 'Singing & Vocals',
    image: '/src/assets/images/cat_bg_singing_1793237432240.jpg',
    tagline: 'Studio Microphones, Vocal Booths & Harmonies',
    description: 'Lead vocals, top-line songwriting, harmonies, and acoustic sessions.'
  },
  Dance: {
    category: 'Dance',
    name: 'Dance & Movement',
    image: '/src/assets/images/cat_bg_dance_1793237432007.jpg',
    tagline: 'Rehearsal Studios, Choreography & Expressive Form',
    description: 'Contemporary dance, physical theatre, kinetic performance, and motion art.'
  },
  Art: {
    category: 'Art',
    name: 'Painting & Illustration',
    image: '/src/assets/images/cat_bg_art_1793237434236.jpg',
    tagline: 'Canvases, Paint Palettes & Atelier Studios',
    description: 'Oil paintings, digital concept art, matte illustration, and visual worldbuilding.'
  },
  Writing: {
    category: 'Writing',
    name: 'Writing & Literature',
    image: '/src/assets/images/cat_bg_writing_1793237434131.jpg',
    tagline: 'Notebooks, Draft Manuscripts & Screenplays',
    description: 'Screenwriting, speculative fiction, worldbuilding lore, and audio drama.'
  },
  Filmmaking: {
    category: 'Filmmaking',
    name: 'Filmmaking & Cinematography',
    image: '/src/assets/images/creative_project_film_1793209901624.jpg',
    tagline: 'Cinema Cameras, Production Sets & Direction',
    description: 'Narrative films, documentary cinematography, camera rigs, and lighting.'
  },
  'Video Editing': {
    category: 'Video Editing',
    name: 'Video Editing & Color Grading',
    image: '/src/assets/images/cat_bg_video_editing_1793237434610.jpg',
    tagline: 'Post-Production Suites, Timelines & Grading',
    description: 'DaVinci color grading, multi-track timelines, VFX cleanup, and rhythmic cuts.'
  }
};
