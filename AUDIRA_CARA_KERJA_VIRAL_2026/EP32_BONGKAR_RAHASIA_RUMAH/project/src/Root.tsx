import React from "react";
import { Composition } from "remotion";
import { PRESETS } from "./core/film/frame.ts";
import { Showcase } from "./scenes/showcase/Showcase.tsx";
import { PeopleDemo, PEOPLE_DEMO_SECONDS } from "./scenes/people/PeopleDemo.tsx";
import { SportsDemo, SPORTS_DEMO_SECONDS } from "./scenes/sports/SportsDemo.tsx";
import { CraftDemo, CRAFT_DEMO_SECONDS } from "./scenes/craft/CraftDemo.tsx";
import { SafeLabelDemo, SAFE_LABEL_DEMO_SECONDS } from "./scenes/qa/SafeLabelDemo.tsx";
import { CyberforgeExample, CYBERFORGE_EXAMPLE_SECONDS } from "./kits/cyberforge/example/CyberforgeExample.tsx";
import { DraftforgeExample, DRAFTFORGE_EXAMPLE_SECONDS } from "./kits/draftforge/example/DraftforgeExample.tsx";
import { ClayworldExample, CLAYWORLD_EXAMPLE_SECONDS } from "./kits/clayworld/example/ClayworldExample.tsx";
import { PolyverseExample, POLYVERSE_EXAMPLE_SECONDS } from "./kits/polyverse/example/PolyverseExample.tsx";
import { ToonforgeExample, TOONFORGE_EXAMPLE_SECONDS } from "./kits/toonforge/example/ToonforgeExample.tsx";
import { GlasscraftExample, GLASSCRAFT_EXAMPLE_SECONDS } from "./kits/glasscraft/example/GlasscraftExample.tsx";
import { PrecisionExample, PRECISION_EXAMPLE_SECONDS } from "./kits/precision/example/PrecisionExample.tsx";
import { InnerworksExample, INNERWORKS_EXAMPLE_SECONDS } from "./kits/innerworks/example/InnerworksExample.tsx";
import { NanoforgeExample, NANOFORGE_EXAMPLE_SECONDS } from "./kits/nanoforge/example/NanoforgeExample.tsx";
import { InkstoryExample, INKSTORY_EXAMPLE_SECONDS } from "./kits/inkstory/example/InkstoryExample.tsx";
import { LidarforgeExample, LIDARFORGE_EXAMPLE_SECONDS } from "./kits/lidarforge/example/LidarforgeExample.tsx";
import { CircuitforgeExample, CIRCUITFORGE_EXAMPLE_SECONDS } from "./kits/circuitforge/example/CircuitforgeExample.tsx";
import { BrickcraftExample, BRICKCRAFT_EXAMPLE_SECONDS } from "./kits/brickcraft/example/BrickcraftExample.tsx";
import { UrbanforgeExample, URBANFORGE_EXAMPLE_SECONDS } from "./kits/urbanforge/example/UrbanforgeExample.tsx";
import { AudirabotExample, AUDIRABOT_EXAMPLE_SECONDS } from "./kits/audirabot/example/AudirabotExample.tsx";
import { DevforgeExample, DEVFORGE_EXAMPLE_SECONDS } from "./kits/devforge/example/DevforgeExample.tsx";
import { ToyDioramaExample, TOYDIORAMA_EXAMPLE_SECONDS } from "./kits/toydiorama/example/ToyDioramaExample.tsx";
import { FilmNoirExample, FILMNOIR_EXAMPLE_SECONDS } from "./kits/filmnoir/example/FilmNoirExample.tsx";
import { WatercolorExample, WATERCOLOR_EXAMPLE_SECONDS } from "./kits/watercolor/example/WatercolorExample.tsx";
import { FluidforgeExample, FLUIDFORGE_EXAMPLE_SECONDS } from "./kits/fluidforge/example/FluidforgeExample.tsx";
import { Hd2dExample, HD2D_EXAMPLE_SECONDS } from "./kits/hd2d/example/Hd2dExample.tsx";
import { MemphisDioramaExample, MEMPHISDIORAMA_EXAMPLE_SECONDS } from "./kits/memphisdiorama/example/MemphisDioramaExample.tsx";
import { DataPhysicalExample, DATAPHYSICAL_EXAMPLE_SECONDS } from "./kits/dataphysical/example/DataPhysicalExample.tsx";
import { SatelliteBriefingExample, SATELLITEBRIEFING_EXAMPLE_SECONDS } from "./kits/satellitebriefing/example/SatelliteBriefingExample.tsx";
import { BackroomsExample, BACKROOMS_EXAMPLE_SECONDS } from "./kits/backrooms/example/BackroomsExample.tsx";
import { VisualInvestigationExample, VISUALINVESTIGATION_EXAMPLE_SECONDS } from "./kits/visualinvestigation/example/VisualInvestigationExample.tsx";
import { TradingTerminalExample, TRADINGTERMINAL_EXAMPLE_SECONDS } from "./kits/tradingterminal/example/TradingTerminalExample.tsx";
import { HistoryMapExample, HISTORYMAP_EXAMPLE_SECONDS } from "./kits/historymap/example/HistoryMapExample.tsx";
import { IslamicDocumentaryExample, ISLAMICDOCUMENTARY_EXAMPLE_SECONDS } from "./kits/islamicdocumentary/example/IslamicDocumentaryExample.tsx";
import { PixelstoryExample, PIXELSTORY_EXAMPLE_SECONDS } from "./kits/pixelstory/example/PixelstoryExample.tsx";
import { VoxelverseExample, VOXELVERSE_EXAMPLE_SECONDS } from "./kits/voxelverse/example/VoxelverseExample.tsx";
import { PaperworldExample, PAPERWORLD_EXAMPLE_SECONDS } from "./kits/paperworld/example/PaperworldExample.tsx";
import { WorldforgeStarter } from "./kits/worldforge/example/Starter.tsx";
import { TimeforgeExample } from "./kits/timeforge/example/ExampleFilm.tsx";
import { BuildforgeExample, BUILDFORGE_EXAMPLE_SECONDS } from "./kits/buildforge/example/BuildforgeExample.tsx";
import { HouseCoverPreview } from "./HouseCoverPreview.tsx";
import { EP32_BongkarRumah, EP32_SECONDS } from "./episodes/ep32/EP32_BongkarRumah.tsx";
import { IsocraftExample, ISOCRAFT_EXAMPLE_SECONDS } from "./kits/isocraft/example/IsocraftExample.tsx";
import { VintageforgeExample, VINTAGEFORGE_EXAMPLE_SECONDS } from "./kits/vintageforge/example/VintageforgeExample.tsx";
import { BrutalforgeExample, BRUTALFORGE_EXAMPLE_SECONDS } from "./kits/brutalforge/example/BrutalforgeExample.tsx";
import { ThermalforgeExample, THERMALFORGE_EXAMPLE_SECONDS } from "./kits/thermalforge/example/ThermalforgeExample.tsx";
import { ChalkcraftExample, CHALKCRAFT_EXAMPLE_SECONDS } from "./kits/chalkcraft/example/ChalkcraftExample.tsx";
import { KintsugiExample, KINTSUGI_EXAMPLE_SECONDS } from "./kits/kintsugi/example/KintsugiExample.tsx";
import { RetrowaveExample, RETROWAVE_EXAMPLE_SECONDS } from "./kits/retrowave/example/RetrowaveExample.tsx";
import { TextvoyageExample, TEXTVOYAGE_EXAMPLE_SECONDS } from "./kits/textvoyage/example/TextvoyageExample.tsx";
import { MistisforgeExample, MISTISFORGE_EXAMPLE_SECONDS } from "./kits/mistisforge/example/MistisforgeExample.tsx";
import { FoodforgeExample, FOODFORGE_EXAMPLE_SECONDS } from "./kits/foodforge/example/FoodforgeExample.tsx";
import { TacticboardExample, TACTICBOARD_EXAMPLE_SECONDS } from "./kits/tacticboard/example/TacticboardExample.tsx";
import { WayangforgeExample, WAYANGFORGE_EXAMPLE_SECONDS } from "./kits/wayangforge/example/WayangforgeExample.tsx";
import { DisastersimExample, DISASTERSIM_EXAMPLE_SECONDS } from "./kits/disastersim/example/DisastersimExample.tsx";
import { ScaleforgeExample, SCALEFORGE_EXAMPLE_SECONDS } from "./kits/scaleforge/example/ScaleforgeExample.tsx";
import { SatisfyforgeExample, SATISFYFORGE_EXAMPLE_SECONDS } from "./kits/satisfyforge/example/SatisfyforgeExample.tsx";
import { ComicforgeExample, COMICFORGE_EXAMPLE_SECONDS } from "./kits/comicforge/example/ComicforgeExample.tsx";
import { AbyssforgeExample, ABYSSFORGE_EXAMPLE_SECONDS } from "./kits/abyssforge/example/AbyssforgeExample.tsx";
import { RisoforgeExample, RISOFORGE_EXAMPLE_SECONDS } from "./kits/risoforge/example/RisoforgeExample.tsx";
import { Y2kchromeExample, Y2KCHROME_EXAMPLE_SECONDS } from "./kits/y2kchrome/example/Y2kchromeExample.tsx";
import { FeltcraftExample, FELTCRAFT_EXAMPLE_SECONDS } from "./kits/feltcraft/example/FeltcraftExample.tsx";
import { AnatomixExample, ANATOMIX_EXAMPLE_SECONDS } from "./kits/anatomix/example/AnatomixExample.tsx";
import { UkiyoforgeExample, UKIYOFORGE_EXAMPLE_SECONDS } from "./kits/ukiyoforge/example/UkiyoforgeExample.tsx";
import { StainedglassExample, STAINEDGLASS_EXAMPLE_SECONDS } from "./kits/stainedglass/example/StainedglassExample.tsx";
import { SulamforgeExample, SULAMFORGE_EXAMPLE_SECONDS } from "./kits/sulamforge/example/SulamforgeExample.tsx";
import { MosaicforgeExample, MOSAICFORGE_EXAMPLE_SECONDS } from "./kits/mosaicforge/example/MosaicforgeExample.tsx";
import { MarblemuseumExample, MARBLEMUSEUM_EXAMPLE_SECONDS } from "./kits/marblemuseum/example/MarblemuseumExample.tsx";
import { TerrariumExample, TERRARIUM_EXAMPLE_SECONDS } from "./kits/terrarium/example/TerrariumExample.tsx";
import { SketchforgeExample, SKETCHFORGE_EXAMPLE_SECONDS } from "./kits/sketchforge/example/SketchforgeExample.tsx";
import { DreamcoreExample, DREAMCORE_EXAMPLE_SECONDS } from "./kits/dreamcore/example/DreamcoreExample.tsx";
import { GacharevealExample, GACHAREVEAL_EXAMPLE_SECONDS } from "./kits/gachareveal/example/GacharevealExample.tsx";
import { ArcadecrtExample, ARCADECRT_EXAMPLE_SECONDS } from "./kits/arcadecrt/example/ArcadecrtExample.tsx";
import { ManuscriptExample, MANUSCRIPT_EXAMPLE_SECONDS } from "./kits/manuscript/example/ManuscriptExample.tsx";
import { GlitchforgeExample, GLITCHFORGE_EXAMPLE_SECONDS } from "./kits/glitchforge/example/GlitchforgeExample.tsx";
import { ChainreactionExample, CHAINREACTION_EXAMPLE_SECONDS } from "./kits/chainreaction/example/ChainreactionExample.tsx";
import { CollageExample, COLLAGE_EXAMPLE_SECONDS } from "./kits/collage/example/CollageExample.tsx";
import { Film16Example, FILM16_EXAMPLE_SECONDS } from "./kits/film16/example/Film16Example.tsx";
import { BatikforgeExample, BATIKFORGE_EXAMPLE_SECONDS } from "./kits/batikforge/example/BatikforgeExample.tsx";
import { InflatableExample, INFLATABLE_EXAMPLE_SECONDS } from "./kits/inflatable/example/InflatableExample.tsx";
import { UkirforgeExample, UKIRFORGE_EXAMPLE_SECONDS } from "./kits/ukirforge/example/UkirforgeExample.tsx";
import { RajutforgeCompositions } from "./kits/rajutforge/register.tsx";
import { OrigamiforgeCompositions } from "./kits/origamiforge/register.tsx";
import { GerabahforgeCompositions } from "./kits/gerabahforge/register.tsx";
import { PainterlyCompositions } from "./kits/painterly/register.tsx";
import { BronzeforgeCompositions } from "./kits/bronzeforge/register.tsx";
import { PlushforgeCompositions } from "./kits/plushforge/register.tsx";
import { PasirforgeCompositions } from "./kits/pasirforge/register.tsx";
import { BroadcastForgeExample, BROADCASTFORGE_EXAMPLE_SECONDS } from "./kits/broadcastforge/example/BroadcastForgeExample.tsx";
import { Explainer2D } from "./scenes/explainer2d/Explainer2D.tsx";

// Register each film twice: a preview (540 × 960 @ 30, for approval) and a final (1080 × 1920 @ 60).
// The 3D renders natively at each size, so the preview is cheap and the final is sharp.
const { preview, final, widePreview, wideFinal } = PRESETS;

export const RemotionRoot: React.FC = () => (
  <>
    {/* 2D Explainer (Pure 2D Motion Graphics, no WebGL/Three.js) */}
    <Composition id="Explainer2DPreview" component={Explainer2D} durationInFrames={5 * preview.fps} fps={preview.fps} width={preview.width} height={preview.height} />
    <Composition id="Explainer2DFinal" component={Explainer2D} durationInFrames={5 * final.fps} fps={final.fps} width={final.width} height={final.height} />
    <Composition id="Explainer2DWidePreview" component={Explainer2D} durationInFrames={5 * widePreview.fps} fps={widePreview.fps} width={widePreview.width} height={widePreview.height} />
    <Composition id="Explainer2DWideFinal" component={Explainer2D} durationInFrames={5 * wideFinal.fps} fps={wideFinal.fps} width={wideFinal.width} height={wideFinal.height} />

    <Composition id="SafeLabelDemoPreview" component={SafeLabelDemo} durationInFrames={SAFE_LABEL_DEMO_SECONDS * preview.fps} fps={preview.fps} width={preview.width} height={preview.height} />
    <Composition id="ShowcasePreview" component={Showcase} durationInFrames={6 * preview.fps} fps={preview.fps} width={preview.width} height={preview.height} />
    <Composition id="ShowcaseFinal" component={Showcase} durationInFrames={6 * final.fps} fps={final.fps} width={final.width} height={final.height} />
    {/* 16:9 long-form (core/film/format.ts): the same scenes rendered wide. Pilot kits first. */}
    <Composition id="ShowcaseWidePreview" component={Showcase} durationInFrames={6 * widePreview.fps} fps={widePreview.fps} width={widePreview.width} height={widePreview.height} />
    <Composition id="InnerworksWidePreview" component={InnerworksExample} durationInFrames={INNERWORKS_EXAMPLE_SECONDS * widePreview.fps} fps={widePreview.fps} width={widePreview.width} height={widePreview.height} />
    <Composition id="InnerworksWideFinal" component={InnerworksExample} durationInFrames={INNERWORKS_EXAMPLE_SECONDS * wideFinal.fps} fps={wideFinal.fps} width={wideFinal.width} height={wideFinal.height} />
    <Composition id="BrickcraftWidePreview" component={BrickcraftExample} durationInFrames={BRICKCRAFT_EXAMPLE_SECONDS * widePreview.fps} fps={widePreview.fps} width={widePreview.width} height={widePreview.height} />
    <Composition id="BrickcraftWideFinal" component={BrickcraftExample} durationInFrames={BRICKCRAFT_EXAMPLE_SECONDS * wideFinal.fps} fps={wideFinal.fps} width={wideFinal.width} height={wideFinal.height} />
    <Composition id="HistoryMapWidePreview" component={HistoryMapExample} durationInFrames={HISTORYMAP_EXAMPLE_SECONDS * widePreview.fps} fps={widePreview.fps} width={widePreview.width} height={widePreview.height} />
    <Composition id="HistoryMapWideFinal" component={HistoryMapExample} durationInFrames={HISTORYMAP_EXAMPLE_SECONDS * wideFinal.fps} fps={wideFinal.fps} width={wideFinal.width} height={wideFinal.height} />
    {/* Reference scene for ToyPerson / SwimCrowd (core/polish/Person.tsx) */}
    <Composition id="PeopleDemoPreview" component={PeopleDemo} durationInFrames={PEOPLE_DEMO_SECONDS * preview.fps} fps={preview.fps} width={preview.width} height={preview.height} />
    {/* Reference scene for the sport library (core/sport): fields, equipment, venues, athletes */}
    <Composition id="SportsDemoPreview" component={SportsDemo} durationInFrames={SPORTS_DEMO_SECONDS * preview.fps} fps={preview.fps} width={preview.width} height={preview.height} />
    <Composition id="SportsDemoWidePreview" component={SportsDemo} durationInFrames={SPORTS_DEMO_SECONDS * widePreview.fps} fps={widePreview.fps} width={widePreview.width} height={widePreview.height} />
    <Composition id="CraftDemoPreview" component={CraftDemo} durationInFrames={CRAFT_DEMO_SECONDS * preview.fps} fps={preview.fps} width={preview.width} height={preview.height} />

    {/* Style 01: PIXELSTORY (example registered for previews) */}
    <Composition id="PixelstoryPreview" component={PixelstoryExample} durationInFrames={PIXELSTORY_EXAMPLE_SECONDS * preview.fps} fps={preview.fps} width={preview.width} height={preview.height} />
    <Composition id="PixelstoryFinal" component={PixelstoryExample} durationInFrames={PIXELSTORY_EXAMPLE_SECONDS * final.fps} fps={final.fps} width={final.width} height={final.height} />
    <Composition id="PixelstoryWidePreview" component={PixelstoryExample} durationInFrames={PIXELSTORY_EXAMPLE_SECONDS * widePreview.fps} fps={widePreview.fps} width={widePreview.width} height={widePreview.height} />
    <Composition id="PixelstoryWideFinal" component={PixelstoryExample} durationInFrames={PIXELSTORY_EXAMPLE_SECONDS * wideFinal.fps} fps={wideFinal.fps} width={wideFinal.width} height={wideFinal.height} />

    {/* Style 02: VOXELVERSE (example registered for previews) */}
    <Composition id="VoxelversePreview" component={VoxelverseExample} durationInFrames={VOXELVERSE_EXAMPLE_SECONDS * preview.fps} fps={preview.fps} width={preview.width} height={preview.height} />
    <Composition id="VoxelverseFinal" component={VoxelverseExample} durationInFrames={VOXELVERSE_EXAMPLE_SECONDS * final.fps} fps={final.fps} width={final.width} height={final.height} />
    <Composition id="VoxelverseWidePreview" component={VoxelverseExample} durationInFrames={VOXELVERSE_EXAMPLE_SECONDS * widePreview.fps} fps={widePreview.fps} width={widePreview.width} height={widePreview.height} />
    <Composition id="VoxelverseWideFinal" component={VoxelverseExample} durationInFrames={VOXELVERSE_EXAMPLE_SECONDS * wideFinal.fps} fps={wideFinal.fps} width={wideFinal.width} height={wideFinal.height} />

    {/* Style 04: PAPERWORLD (example registered for previews) */}
    <Composition id="PaperworldPreview" component={PaperworldExample} durationInFrames={PAPERWORLD_EXAMPLE_SECONDS * preview.fps} fps={preview.fps} width={preview.width} height={preview.height} />
    <Composition id="PaperworldFinal" component={PaperworldExample} durationInFrames={PAPERWORLD_EXAMPLE_SECONDS * final.fps} fps={final.fps} width={final.width} height={final.height} />
    <Composition id="PaperworldWidePreview" component={PaperworldExample} durationInFrames={PAPERWORLD_EXAMPLE_SECONDS * widePreview.fps} fps={widePreview.fps} width={widePreview.width} height={widePreview.height} />
    <Composition id="PaperworldWideFinal" component={PaperworldExample} durationInFrames={PAPERWORLD_EXAMPLE_SECONDS * wideFinal.fps} fps={wideFinal.fps} width={wideFinal.width} height={wideFinal.height} />

    {/* Style 06: WORLDFORGE (example registered for previews) */}
    <Composition id="WorldforgePreview" component={WorldforgeStarter} durationInFrames={2 * preview.fps} fps={preview.fps} width={preview.width} height={preview.height} />
    <Composition id="WorldforgeFinal" component={WorldforgeStarter} durationInFrames={2 * final.fps} fps={final.fps} width={final.width} height={final.height} />
    <Composition id="WorldforgeWidePreview" component={WorldforgeStarter} durationInFrames={2 * widePreview.fps} fps={widePreview.fps} width={widePreview.width} height={widePreview.height} />
    <Composition id="WorldforgeWideFinal" component={WorldforgeStarter} durationInFrames={2 * wideFinal.fps} fps={wideFinal.fps} width={wideFinal.width} height={wideFinal.height} />

    {/* Style 07: TIMEFORGE (example registered for previews) */}
    <Composition id="TimeforgePreview" component={TimeforgeExample} durationInFrames={7 * preview.fps} fps={preview.fps} width={preview.width} height={preview.height} />
    <Composition id="TimeforgeFinal" component={TimeforgeExample} durationInFrames={7 * final.fps} fps={final.fps} width={final.width} height={final.height} />
    <Composition id="TimeforgeWidePreview" component={TimeforgeExample} durationInFrames={7 * widePreview.fps} fps={widePreview.fps} width={widePreview.width} height={widePreview.height} />
    <Composition id="TimeforgeWideFinal" component={TimeforgeExample} durationInFrames={7 * wideFinal.fps} fps={wideFinal.fps} width={wideFinal.width} height={wideFinal.height} />

    {/* EP32 House Cover — real two-story GLB in BUILDFORGE style */}
    <Composition id="HouseCoverPreview" component={HouseCoverPreview} durationInFrames={5 * preview.fps} fps={preview.fps} width={preview.width} height={preview.height} />

    {/* EP32 Main — BONGKAR RAHASIA RUMAH */}
    <Composition id="EP32Preview" component={EP32_BongkarRumah} durationInFrames={EP32_SECONDS * preview.fps} fps={preview.fps} width={preview.width} height={preview.height} />
    <Composition id="EP32Final" component={EP32_BongkarRumah} durationInFrames={EP32_SECONDS * final.fps} fps={final.fps} width={final.width} height={final.height} />

    {/* Style 08: BUILDFORGE (example registered for previews) */}
    <Composition id="BuildforgePreview" component={BuildforgeExample} durationInFrames={BUILDFORGE_EXAMPLE_SECONDS * preview.fps} fps={preview.fps} width={preview.width} height={preview.height} />
    <Composition id="BuildforgeFinal" component={BuildforgeExample} durationInFrames={BUILDFORGE_EXAMPLE_SECONDS * final.fps} fps={final.fps} width={final.width} height={final.height} />
    <Composition id="BuildforgeWidePreview" component={BuildforgeExample} durationInFrames={BUILDFORGE_EXAMPLE_SECONDS * widePreview.fps} fps={widePreview.fps} width={widePreview.width} height={widePreview.height} />
    <Composition id="BuildforgeWideFinal" component={BuildforgeExample} durationInFrames={BUILDFORGE_EXAMPLE_SECONDS * wideFinal.fps} fps={wideFinal.fps} width={wideFinal.width} height={wideFinal.height} />

    {/* Style 21: ISOCRAFT (example registered for previews) */}
    <Composition id="IsocraftPreview" component={IsocraftExample} durationInFrames={ISOCRAFT_EXAMPLE_SECONDS * preview.fps} fps={preview.fps} width={preview.width} height={preview.height} />
    <Composition id="IsocraftFinal" component={IsocraftExample} durationInFrames={ISOCRAFT_EXAMPLE_SECONDS * final.fps} fps={final.fps} width={final.width} height={final.height} />
    <Composition id="IsocraftWidePreview" component={IsocraftExample} durationInFrames={ISOCRAFT_EXAMPLE_SECONDS * widePreview.fps} fps={widePreview.fps} width={widePreview.width} height={widePreview.height} />
    <Composition id="IsocraftWideFinal" component={IsocraftExample} durationInFrames={ISOCRAFT_EXAMPLE_SECONDS * wideFinal.fps} fps={wideFinal.fps} width={wideFinal.width} height={wideFinal.height} />

    {/* Style 22: VINTAGEFORGE (example registered for previews) */}
    <Composition id="VintageforgePreview" component={VintageforgeExample} durationInFrames={VINTAGEFORGE_EXAMPLE_SECONDS * preview.fps} fps={preview.fps} width={preview.width} height={preview.height} />
    <Composition id="VintageforgeFinal" component={VintageforgeExample} durationInFrames={VINTAGEFORGE_EXAMPLE_SECONDS * final.fps} fps={final.fps} width={final.width} height={final.height} />
    <Composition id="VintageforgeWidePreview" component={VintageforgeExample} durationInFrames={VINTAGEFORGE_EXAMPLE_SECONDS * widePreview.fps} fps={widePreview.fps} width={widePreview.width} height={widePreview.height} />
    <Composition id="VintageforgeWideFinal" component={VintageforgeExample} durationInFrames={VINTAGEFORGE_EXAMPLE_SECONDS * wideFinal.fps} fps={wideFinal.fps} width={wideFinal.width} height={wideFinal.height} />

    {/* Style 23: BRUTALFORGE (example registered for previews) */}
    <Composition id="BrutalforgePreview" component={BrutalforgeExample} durationInFrames={BRUTALFORGE_EXAMPLE_SECONDS * preview.fps} fps={preview.fps} width={preview.width} height={preview.height} />
    <Composition id="BrutalforgeFinal" component={BrutalforgeExample} durationInFrames={BRUTALFORGE_EXAMPLE_SECONDS * final.fps} fps={final.fps} width={final.width} height={final.height} />
    <Composition id="BrutalforgeWidePreview" component={BrutalforgeExample} durationInFrames={BRUTALFORGE_EXAMPLE_SECONDS * widePreview.fps} fps={widePreview.fps} width={widePreview.width} height={widePreview.height} />
    <Composition id="BrutalforgeWideFinal" component={BrutalforgeExample} durationInFrames={BRUTALFORGE_EXAMPLE_SECONDS * wideFinal.fps} fps={wideFinal.fps} width={wideFinal.width} height={wideFinal.height} />

    {/* Style 24: THERMALFORGE (example registered for previews) */}
    <Composition id="ThermalforgePreview" component={ThermalforgeExample} durationInFrames={THERMALFORGE_EXAMPLE_SECONDS * preview.fps} fps={preview.fps} width={preview.width} height={preview.height} />
    <Composition id="ThermalforgeFinal" component={ThermalforgeExample} durationInFrames={THERMALFORGE_EXAMPLE_SECONDS * final.fps} fps={final.fps} width={final.width} height={final.height} />
    <Composition id="ThermalforgeWidePreview" component={ThermalforgeExample} durationInFrames={THERMALFORGE_EXAMPLE_SECONDS * widePreview.fps} fps={widePreview.fps} width={widePreview.width} height={widePreview.height} />
    <Composition id="ThermalforgeWideFinal" component={ThermalforgeExample} durationInFrames={THERMALFORGE_EXAMPLE_SECONDS * wideFinal.fps} fps={wideFinal.fps} width={wideFinal.width} height={wideFinal.height} />

    {/* Style 25: CHALKCRAFT (example registered for previews) */}
    <Composition id="ChalkcraftPreview" component={ChalkcraftExample} durationInFrames={CHALKCRAFT_EXAMPLE_SECONDS * preview.fps} fps={preview.fps} width={preview.width} height={preview.height} />
    <Composition id="ChalkcraftFinal" component={ChalkcraftExample} durationInFrames={CHALKCRAFT_EXAMPLE_SECONDS * final.fps} fps={final.fps} width={final.width} height={final.height} />
    <Composition id="ChalkcraftWidePreview" component={ChalkcraftExample} durationInFrames={CHALKCRAFT_EXAMPLE_SECONDS * widePreview.fps} fps={widePreview.fps} width={widePreview.width} height={widePreview.height} />
    <Composition id="ChalkcraftWideFinal" component={ChalkcraftExample} durationInFrames={CHALKCRAFT_EXAMPLE_SECONDS * wideFinal.fps} fps={wideFinal.fps} width={wideFinal.width} height={wideFinal.height} />

    {/* Style 26: KINTSUGI (example registered for previews) */}
    <Composition id="KintsugiPreview" component={KintsugiExample} durationInFrames={KINTSUGI_EXAMPLE_SECONDS * preview.fps} fps={preview.fps} width={preview.width} height={preview.height} />
    <Composition id="KintsugiFinal" component={KintsugiExample} durationInFrames={KINTSUGI_EXAMPLE_SECONDS * final.fps} fps={final.fps} width={final.width} height={final.height} />
    <Composition id="KintsugiWidePreview" component={KintsugiExample} durationInFrames={KINTSUGI_EXAMPLE_SECONDS * widePreview.fps} fps={widePreview.fps} width={widePreview.width} height={widePreview.height} />
    <Composition id="KintsugiWideFinal" component={KintsugiExample} durationInFrames={KINTSUGI_EXAMPLE_SECONDS * wideFinal.fps} fps={wideFinal.fps} width={wideFinal.width} height={wideFinal.height} />

    {/* Style 27: RETROWAVE (example registered for previews) */}
    <Composition id="RetrowavePreview" component={RetrowaveExample} durationInFrames={RETROWAVE_EXAMPLE_SECONDS * preview.fps} fps={preview.fps} width={preview.width} height={preview.height} />
    <Composition id="RetrowaveFinal" component={RetrowaveExample} durationInFrames={RETROWAVE_EXAMPLE_SECONDS * final.fps} fps={final.fps} width={final.width} height={final.height} />
    <Composition id="RetrowaveWidePreview" component={RetrowaveExample} durationInFrames={RETROWAVE_EXAMPLE_SECONDS * widePreview.fps} fps={widePreview.fps} width={widePreview.width} height={widePreview.height} />
    <Composition id="RetrowaveWideFinal" component={RetrowaveExample} durationInFrames={RETROWAVE_EXAMPLE_SECONDS * wideFinal.fps} fps={wideFinal.fps} width={wideFinal.width} height={wideFinal.height} />

    {/* Style 28: TEXTVOYAGE (example registered for previews) */}
    <Composition id="TextvoyagePreview" component={TextvoyageExample} durationInFrames={TEXTVOYAGE_EXAMPLE_SECONDS * preview.fps} fps={preview.fps} width={preview.width} height={preview.height} />
    <Composition id="TextvoyageFinal" component={TextvoyageExample} durationInFrames={TEXTVOYAGE_EXAMPLE_SECONDS * final.fps} fps={final.fps} width={final.width} height={final.height} />
    <Composition id="TextvoyageWidePreview" component={TextvoyageExample} durationInFrames={TEXTVOYAGE_EXAMPLE_SECONDS * widePreview.fps} fps={widePreview.fps} width={widePreview.width} height={widePreview.height} />
    <Composition id="TextvoyageWideFinal" component={TextvoyageExample} durationInFrames={TEXTVOYAGE_EXAMPLE_SECONDS * wideFinal.fps} fps={wideFinal.fps} width={wideFinal.width} height={wideFinal.height} />

    {/* Style 09: CYBERFORGE (Holographic Sci-Fi & HUD Telemetry) */}
    <Composition
      id="CyberforgePreview"
      component={CyberforgeExample}
      durationInFrames={CYBERFORGE_EXAMPLE_SECONDS * preview.fps}
      fps={preview.fps}
      width={preview.width}
      height={preview.height}
    />
    <Composition
      id="CyberforgeFinal"
      component={CyberforgeExample}
      durationInFrames={CYBERFORGE_EXAMPLE_SECONDS * final.fps}
      fps={final.fps}
      width={final.width}
      height={final.height}
    />
    <Composition id="CyberforgeWidePreview" component={CyberforgeExample} durationInFrames={CYBERFORGE_EXAMPLE_SECONDS * widePreview.fps} fps={widePreview.fps} width={widePreview.width} height={widePreview.height} />
    <Composition id="CyberforgeWideFinal" component={CyberforgeExample} durationInFrames={CYBERFORGE_EXAMPLE_SECONDS * wideFinal.fps} fps={wideFinal.fps} width={wideFinal.width} height={wideFinal.height} />

    {/* Style 10: DRAFTFORGE (Architectural CAD Blueprints & Technical Schematics) */}
    <Composition
      id="DraftforgePreview"
      component={DraftforgeExample}
      durationInFrames={DRAFTFORGE_EXAMPLE_SECONDS * preview.fps}
      fps={preview.fps}
      width={preview.width}
      height={preview.height}
    />
    <Composition
      id="DraftforgeFinal"
      component={DraftforgeExample}
      durationInFrames={DRAFTFORGE_EXAMPLE_SECONDS * final.fps}
      fps={final.fps}
      width={final.width}
      height={final.height}
    />
    <Composition id="DraftforgeWidePreview" component={DraftforgeExample} durationInFrames={DRAFTFORGE_EXAMPLE_SECONDS * widePreview.fps} fps={widePreview.fps} width={widePreview.width} height={widePreview.height} />
    <Composition id="DraftforgeWideFinal" component={DraftforgeExample} durationInFrames={DRAFTFORGE_EXAMPLE_SECONDS * wideFinal.fps} fps={wideFinal.fps} width={wideFinal.width} height={wideFinal.height} />

    {/* Style 11: CLAYWORLD (Tactile Stop-Motion Claymation & Plasticine Diorama) */}
    <Composition
      id="ClayworldPreview"
      component={ClayworldExample}
      durationInFrames={CLAYWORLD_EXAMPLE_SECONDS * preview.fps}
      fps={preview.fps}
      width={preview.width}
      height={preview.height}
    />
    <Composition
      id="ClayworldFinal"
      component={ClayworldExample}
      durationInFrames={CLAYWORLD_EXAMPLE_SECONDS * final.fps}
      fps={final.fps}
      width={final.width}
      height={final.height}
    />
    <Composition id="ClayworldWidePreview" component={ClayworldExample} durationInFrames={CLAYWORLD_EXAMPLE_SECONDS * widePreview.fps} fps={widePreview.fps} width={widePreview.width} height={widePreview.height} />
    <Composition id="ClayworldWideFinal" component={ClayworldExample} durationInFrames={CLAYWORLD_EXAMPLE_SECONDS * wideFinal.fps} fps={wideFinal.fps} width={wideFinal.width} height={wideFinal.height} />

    {/* Style 12: POLYVERSE (Faceted Low-Poly Minimalist Worlds & Floating Islands) */}
    <Composition
      id="PolyversePreview"
      component={PolyverseExample}
      durationInFrames={POLYVERSE_EXAMPLE_SECONDS * preview.fps}
      fps={preview.fps}
      width={preview.width}
      height={preview.height}
    />
    <Composition
      id="PolyverseFinal"
      component={PolyverseExample}
      durationInFrames={POLYVERSE_EXAMPLE_SECONDS * final.fps}
      fps={final.fps}
      width={final.width}
      height={final.height}
    />
    <Composition id="PolyverseWidePreview" component={PolyverseExample} durationInFrames={POLYVERSE_EXAMPLE_SECONDS * widePreview.fps} fps={widePreview.fps} width={widePreview.width} height={widePreview.height} />
    <Composition id="PolyverseWideFinal" component={PolyverseExample} durationInFrames={POLYVERSE_EXAMPLE_SECONDS * wideFinal.fps} fps={wideFinal.fps} width={wideFinal.width} height={wideFinal.height} />

    {/* Style 13: TOONFORGE (Cel-Shaded 3D Anime, Ink Contours & Manga Speed Lines) */}
    <Composition
      id="ToonforgePreview"
      component={ToonforgeExample}
      durationInFrames={TOONFORGE_EXAMPLE_SECONDS * preview.fps}
      fps={preview.fps}
      width={preview.width}
      height={preview.height}
    />
    <Composition
      id="ToonforgeFinal"
      component={ToonforgeExample}
      durationInFrames={TOONFORGE_EXAMPLE_SECONDS * final.fps}
      fps={final.fps}
      width={final.width}
      height={final.height}
    />
    <Composition id="ToonforgeWidePreview" component={ToonforgeExample} durationInFrames={TOONFORGE_EXAMPLE_SECONDS * widePreview.fps} fps={widePreview.fps} width={widePreview.width} height={widePreview.height} />
    <Composition id="ToonforgeWideFinal" component={ToonforgeExample} durationInFrames={TOONFORGE_EXAMPLE_SECONDS * wideFinal.fps} fps={wideFinal.fps} width={wideFinal.width} height={wideFinal.height} />

    {/* Style 14: GLASSCRAFT (Spatial Glassmorphism & Liquid Prisms) */}
    <Composition
      id="GlasscraftPreview"
      component={GlasscraftExample}
      durationInFrames={GLASSCRAFT_EXAMPLE_SECONDS * preview.fps}
      fps={preview.fps}
      width={preview.width}
      height={preview.height}
    />
    <Composition
      id="GlasscraftFinal"
      component={GlasscraftExample}
      durationInFrames={GLASSCRAFT_EXAMPLE_SECONDS * final.fps}
      fps={final.fps}
      width={final.width}
      height={final.height}
    />
    <Composition id="GlasscraftWidePreview" component={GlasscraftExample} durationInFrames={GLASSCRAFT_EXAMPLE_SECONDS * widePreview.fps} fps={widePreview.fps} width={widePreview.width} height={widePreview.height} />
    <Composition id="GlasscraftWideFinal" component={GlasscraftExample} durationInFrames={GLASSCRAFT_EXAMPLE_SECONDS * wideFinal.fps} fps={wideFinal.fps} width={wideFinal.width} height={wideFinal.height} />

    {/* Style 03: PRECISION (Industrial CMF & Exploded Product Cinematics) */}
    <Composition
      id="PrecisionPreview"
      component={PrecisionExample}
      durationInFrames={PRECISION_EXAMPLE_SECONDS * preview.fps}
      fps={preview.fps}
      width={preview.width}
      height={preview.height}
    />
    <Composition
      id="PrecisionFinal"
      component={PrecisionExample}
      durationInFrames={PRECISION_EXAMPLE_SECONDS * final.fps}
      fps={final.fps}
      width={final.width}
      height={final.height}
    />
    <Composition id="PrecisionWidePreview" component={PrecisionExample} durationInFrames={PRECISION_EXAMPLE_SECONDS * widePreview.fps} fps={widePreview.fps} width={widePreview.width} height={widePreview.height} />
    <Composition id="PrecisionWideFinal" component={PrecisionExample} durationInFrames={PRECISION_EXAMPLE_SECONDS * wideFinal.fps} fps={wideFinal.fps} width={wideFinal.width} height={wideFinal.height} />

    {/* Style 05: INNERWORKS (Technical X-Ray Cutaway & Mechanical Kinematics) */}
    <Composition
      id="InnerworksPreview"
      component={InnerworksExample}
      durationInFrames={INNERWORKS_EXAMPLE_SECONDS * preview.fps}
      fps={preview.fps}
      width={preview.width}
      height={preview.height}
    />
    <Composition
      id="InnerworksFinal"
      component={InnerworksExample}
      durationInFrames={INNERWORKS_EXAMPLE_SECONDS * final.fps}
      fps={final.fps}
      width={final.width}
      height={final.height}
    />

    {/* Style 15: NANOFORGE (Microscopic Molecular Biology & Cryo-EM Nanotech) */}
    <Composition
      id="NanoforgePreview"
      component={NanoforgeExample}
      durationInFrames={NANOFORGE_EXAMPLE_SECONDS * preview.fps}
      fps={preview.fps}
      width={preview.width}
      height={preview.height}
    />
    <Composition
      id="NanoforgeFinal"
      component={NanoforgeExample}
      durationInFrames={NANOFORGE_EXAMPLE_SECONDS * final.fps}
      fps={final.fps}
      width={final.width}
      height={final.height}
    />
    <Composition id="NanoforgeWidePreview" component={NanoforgeExample} durationInFrames={NANOFORGE_EXAMPLE_SECONDS * widePreview.fps} fps={widePreview.fps} width={widePreview.width} height={widePreview.height} />
    <Composition id="NanoforgeWideFinal" component={NanoforgeExample} durationInFrames={NANOFORGE_EXAMPLE_SECONDS * wideFinal.fps} fps={wideFinal.fps} width={wideFinal.width} height={wideFinal.height} />

    {/* Style 16: INKSTORY (East Asian Ink Wash, Shan Shui Mountains & Zen Calligraphy) */}
    <Composition
      id="InkstoryPreview"
      component={InkstoryExample}
      durationInFrames={INKSTORY_EXAMPLE_SECONDS * preview.fps}
      fps={preview.fps}
      width={preview.width}
      height={preview.height}
    />
    <Composition
      id="InkstoryFinal"
      component={InkstoryExample}
      durationInFrames={INKSTORY_EXAMPLE_SECONDS * final.fps}
      fps={final.fps}
      width={final.width}
      height={final.height}
    />
    <Composition id="InkstoryWidePreview" component={InkstoryExample} durationInFrames={INKSTORY_EXAMPLE_SECONDS * widePreview.fps} fps={widePreview.fps} width={widePreview.width} height={widePreview.height} />
    <Composition id="InkstoryWideFinal" component={InkstoryExample} durationInFrames={INKSTORY_EXAMPLE_SECONDS * wideFinal.fps} fps={wideFinal.fps} width={wideFinal.width} height={wideFinal.height} />

    {/* Style 17: LIDARFORGE (3D Point Cloud Aerial Survey, Laser Scanning & Elevation Bathymetry) */}
    <Composition
      id="LidarforgePreview"
      component={LidarforgeExample}
      durationInFrames={LIDARFORGE_EXAMPLE_SECONDS * preview.fps}
      fps={preview.fps}
      width={preview.width}
      height={preview.height}
    />
    <Composition
      id="LidarforgeFinal"
      component={LidarforgeExample}
      durationInFrames={LIDARFORGE_EXAMPLE_SECONDS * final.fps}
      fps={final.fps}
      width={final.width}
      height={final.height}
    />
    <Composition id="LidarforgeWidePreview" component={LidarforgeExample} durationInFrames={LIDARFORGE_EXAMPLE_SECONDS * widePreview.fps} fps={widePreview.fps} width={widePreview.width} height={widePreview.height} />
    <Composition id="LidarforgeWideFinal" component={LidarforgeExample} durationInFrames={LIDARFORGE_EXAMPLE_SECONDS * wideFinal.fps} fps={wideFinal.fps} width={wideFinal.width} height={wideFinal.height} />

    {/* Style 18: CIRCUITFORGE (3D PCB Electronics, SMT Microchips & Copper Electron Streams) */}
    <Composition
      id="CircuitforgePreview"
      component={CircuitforgeExample}
      durationInFrames={CIRCUITFORGE_EXAMPLE_SECONDS * preview.fps}
      fps={preview.fps}
      width={preview.width}
      height={preview.height}
    />
    <Composition
      id="CircuitforgeFinal"
      component={CircuitforgeExample}
      durationInFrames={CIRCUITFORGE_EXAMPLE_SECONDS * final.fps}
      fps={final.fps}
      width={final.width}
      height={final.height}
    />
    <Composition id="CircuitforgeWidePreview" component={CircuitforgeExample} durationInFrames={CIRCUITFORGE_EXAMPLE_SECONDS * widePreview.fps} fps={widePreview.fps} width={widePreview.width} height={widePreview.height} />
    <Composition id="CircuitforgeWideFinal" component={CircuitforgeExample} durationInFrames={CIRCUITFORGE_EXAMPLE_SECONDS * wideFinal.fps} fps={wideFinal.fps} width={wideFinal.width} height={wideFinal.height} />

    {/* Style 19: BRICKCRAFT (Tactile Plastic Bricks, Interlocking Stud Geometry & Macro Toy Stop-Motion) */}
    <Composition
      id="BrickcraftPreview"
      component={BrickcraftExample}
      durationInFrames={BRICKCRAFT_EXAMPLE_SECONDS * preview.fps}
      fps={preview.fps}
      width={preview.width}
      height={preview.height}
    />
    <Composition
      id="BrickcraftFinal"
      component={BrickcraftExample}
      durationInFrames={BRICKCRAFT_EXAMPLE_SECONDS * final.fps}
      fps={final.fps}
      width={final.width}
      height={final.height}
    />

    {/* Style 20: URBANFORGE (Architectural White Model, Real Sun Shadows & Dynamic Data Projection) */}
    <Composition
      id="UrbanforgePreview"
      component={UrbanforgeExample}
      durationInFrames={URBANFORGE_EXAMPLE_SECONDS * preview.fps}
      fps={preview.fps}
      width={preview.width}
      height={preview.height}
    />
    <Composition
      id="UrbanforgeFinal"
      component={UrbanforgeExample}
      durationInFrames={URBANFORGE_EXAMPLE_SECONDS * final.fps}
      fps={final.fps}
      width={final.width}
      height={final.height}
    />
    <Composition id="UrbanforgeWidePreview" component={UrbanforgeExample} durationInFrames={URBANFORGE_EXAMPLE_SECONDS * widePreview.fps} fps={widePreview.fps} width={widePreview.width} height={widePreview.height} />
    <Composition id="UrbanforgeWideFinal" component={UrbanforgeExample} durationInFrames={URBANFORGE_EXAMPLE_SECONDS * wideFinal.fps} fps={wideFinal.fps} width={wideFinal.width} height={wideFinal.height} />

    {/* Style 29: AUDIRABOT (Official 3D Mascot Companion & Telemetry Engine) */}
    <Composition
      id="AudirabotPreview"
      component={AudirabotExample}
      durationInFrames={AUDIRABOT_EXAMPLE_SECONDS * preview.fps}
      fps={preview.fps}
      width={preview.width}
      height={preview.height}
    />
    <Composition
      id="AudirabotFinal"
      component={AudirabotExample}
      durationInFrames={AUDIRABOT_EXAMPLE_SECONDS * final.fps}
      fps={final.fps}
      width={final.width}
      height={final.height}
    />
    <Composition id="AudirabotWidePreview" component={AudirabotExample} durationInFrames={AUDIRABOT_EXAMPLE_SECONDS * widePreview.fps} fps={widePreview.fps} width={widePreview.width} height={widePreview.height} />
    <Composition id="AudirabotWideFinal" component={AudirabotExample} durationInFrames={AUDIRABOT_EXAMPLE_SECONDS * wideFinal.fps} fps={wideFinal.fps} width={wideFinal.width} height={wideFinal.height} />

    {/* Style 30: DEVFORGE (3D Spatial IDE & Game Dev Hustle Engine) */}
    <Composition
      id="DevforgePreview"
      component={DevforgeExample}
      durationInFrames={DEVFORGE_EXAMPLE_SECONDS * preview.fps}
      fps={preview.fps}
      width={preview.width}
      height={preview.height}
    />
    <Composition
      id="DevforgeFinal"
      component={DevforgeExample}
      durationInFrames={DEVFORGE_EXAMPLE_SECONDS * final.fps}
      fps={final.fps}
      width={final.width}
      height={final.height}
    />
    <Composition id="DevforgeWidePreview" component={DevforgeExample} durationInFrames={DEVFORGE_EXAMPLE_SECONDS * widePreview.fps} fps={widePreview.fps} width={widePreview.width} height={widePreview.height} />
    <Composition id="DevforgeWideFinal" component={DevforgeExample} durationInFrames={DEVFORGE_EXAMPLE_SECONDS * wideFinal.fps} fps={wideFinal.fps} width={wideFinal.width} height={wideFinal.height} />

    {/* Style 31: TOYDIORAMA (Stylized 3D Toy Diorama & Miniature Theatrical Stage) */}
    <Composition
      id="ToyDioramaPreview"
      component={ToyDioramaExample}
      durationInFrames={TOYDIORAMA_EXAMPLE_SECONDS * preview.fps}
      fps={preview.fps}
      width={preview.width}
      height={preview.height}
    />
    <Composition
      id="ToyDioramaFinal"
      component={ToyDioramaExample}
      durationInFrames={TOYDIORAMA_EXAMPLE_SECONDS * final.fps}
      fps={final.fps}
      width={final.width}
      height={final.height}
    />
    <Composition id="ToyDioramaWidePreview" component={ToyDioramaExample} durationInFrames={TOYDIORAMA_EXAMPLE_SECONDS * widePreview.fps} fps={widePreview.fps} width={widePreview.width} height={widePreview.height} />
    <Composition id="ToyDioramaWideFinal" component={ToyDioramaExample} durationInFrames={TOYDIORAMA_EXAMPLE_SECONDS * wideFinal.fps} fps={wideFinal.fps} width={wideFinal.width} height={wideFinal.height} />

    {/* Style 32: FILMNOIR (Classic Cinematic Film Noir & Chiaroscuro) */}
    <Composition
      id="FilmNoirPreview"
      component={FilmNoirExample}
      durationInFrames={FILMNOIR_EXAMPLE_SECONDS * preview.fps}
      fps={preview.fps}
      width={preview.width}
      height={preview.height}
    />
    <Composition
      id="FilmNoirFinal"
      component={FilmNoirExample}
      durationInFrames={FILMNOIR_EXAMPLE_SECONDS * final.fps}
      fps={final.fps}
      width={final.width}
      height={final.height}
    />
    <Composition id="FilmNoirWidePreview" component={FilmNoirExample} durationInFrames={FILMNOIR_EXAMPLE_SECONDS * widePreview.fps} fps={widePreview.fps} width={widePreview.width} height={widePreview.height} />
    <Composition id="FilmNoirWideFinal" component={FilmNoirExample} durationInFrames={FILMNOIR_EXAMPLE_SECONDS * wideFinal.fps} fps={wideFinal.fps} width={wideFinal.width} height={wideFinal.height} />

    {/* Style 33: WATERCOLOR (European Children's Tale & Storybook Watercolor) */}
    <Composition
      id="WatercolorPreview"
      component={WatercolorExample}
      durationInFrames={WATERCOLOR_EXAMPLE_SECONDS * preview.fps}
      fps={preview.fps}
      width={preview.width}
      height={preview.height}
    />
    <Composition
      id="WatercolorFinal"
      component={WatercolorExample}
      durationInFrames={WATERCOLOR_EXAMPLE_SECONDS * final.fps}
      fps={final.fps}
      width={final.width}
      height={final.height}
    />
    <Composition id="WatercolorWidePreview" component={WatercolorExample} durationInFrames={WATERCOLOR_EXAMPLE_SECONDS * widePreview.fps} fps={widePreview.fps} width={widePreview.width} height={widePreview.height} />
    <Composition id="WatercolorWideFinal" component={WatercolorExample} durationInFrames={WATERCOLOR_EXAMPLE_SECONDS * wideFinal.fps} fps={wideFinal.fps} width={wideFinal.width} height={wideFinal.height} />

    {/* Style 34: FLUIDFORGE (Abstract Fluid Motion & Iridescent Liquid Metal) */}
    <Composition
      id="FluidforgePreview"
      component={FluidforgeExample}
      durationInFrames={FLUIDFORGE_EXAMPLE_SECONDS * preview.fps}
      fps={preview.fps}
      width={preview.width}
      height={preview.height}
    />
    <Composition
      id="FluidforgeFinal"
      component={FluidforgeExample}
      durationInFrames={FLUIDFORGE_EXAMPLE_SECONDS * final.fps}
      fps={final.fps}
      width={final.width}
      height={final.height}
    />
    <Composition id="FluidforgeWidePreview" component={FluidforgeExample} durationInFrames={FLUIDFORGE_EXAMPLE_SECONDS * widePreview.fps} fps={widePreview.fps} width={widePreview.width} height={widePreview.height} />
    <Composition id="FluidforgeWideFinal" component={FluidforgeExample} durationInFrames={FLUIDFORGE_EXAMPLE_SECONDS * wideFinal.fps} fps={wideFinal.fps} width={wideFinal.width} height={wideFinal.height} />

    {/* Style 35: HD2D (HD-2D Diorama & Tilt-Shift Pixel World) */}
    <Composition
      id="Hd2dPreview"
      component={Hd2dExample}
      durationInFrames={HD2D_EXAMPLE_SECONDS * preview.fps}
      fps={preview.fps}
      width={preview.width}
      height={preview.height}
    />
    <Composition
      id="Hd2dFinal"
      component={Hd2dExample}
      durationInFrames={HD2D_EXAMPLE_SECONDS * final.fps}
      fps={final.fps}
      width={final.width}
      height={final.height}
    />
    <Composition id="Hd2dWidePreview" component={Hd2dExample} durationInFrames={HD2D_EXAMPLE_SECONDS * widePreview.fps} fps={widePreview.fps} width={widePreview.width} height={widePreview.height} />
    <Composition id="Hd2dWideFinal" component={Hd2dExample} durationInFrames={HD2D_EXAMPLE_SECONDS * wideFinal.fps} fps={wideFinal.fps} width={wideFinal.width} height={wideFinal.height} />

    {/* Style 36: MEMPHISDIORAMA (1980s Ettore Sottsass Architectural Tabletop Model) */}
    <Composition
      id="MemphisDioramaPreview"
      component={MemphisDioramaExample}
      durationInFrames={MEMPHISDIORAMA_EXAMPLE_SECONDS * preview.fps}
      fps={preview.fps}
      width={preview.width}
      height={preview.height}
    />
    <Composition
      id="MemphisDioramaFinal"
      component={MemphisDioramaExample}
      durationInFrames={MEMPHISDIORAMA_EXAMPLE_SECONDS * final.fps}
      fps={final.fps}
      width={final.width}
      height={final.height}
    />
    <Composition id="MemphisDioramaWidePreview" component={MemphisDioramaExample} durationInFrames={MEMPHISDIORAMA_EXAMPLE_SECONDS * widePreview.fps} fps={widePreview.fps} width={widePreview.width} height={widePreview.height} />
    <Composition id="MemphisDioramaWideFinal" component={MemphisDioramaExample} durationInFrames={MEMPHISDIORAMA_EXAMPLE_SECONDS * wideFinal.fps} fps={wideFinal.fps} width={wideFinal.width} height={wideFinal.height} />

    {/* Style 37: DATAPHYSICAL (3D Data Physicalization & Sculptural Stats) */}
    <Composition
      id="DataPhysicalPreview"
      component={DataPhysicalExample}
      durationInFrames={DATAPHYSICAL_EXAMPLE_SECONDS * preview.fps}
      fps={preview.fps}
      width={preview.width}
      height={preview.height}
    />
    <Composition
      id="DataPhysicalFinal"
      component={DataPhysicalExample}
      durationInFrames={DATAPHYSICAL_EXAMPLE_SECONDS * final.fps}
      fps={final.fps}
      width={final.width}
      height={final.height}
    />
    <Composition id="DataPhysicalWidePreview" component={DataPhysicalExample} durationInFrames={DATAPHYSICAL_EXAMPLE_SECONDS * widePreview.fps} fps={widePreview.fps} width={widePreview.width} height={widePreview.height} />
    <Composition id="DataPhysicalWideFinal" component={DataPhysicalExample} durationInFrames={DATAPHYSICAL_EXAMPLE_SECONDS * wideFinal.fps} fps={wideFinal.fps} width={wideFinal.width} height={wideFinal.height} />

    {/* Style 38: SATELLITEBRIEFING (3D Satellite & OSINT Geospatial Reconnaissance) */}
    <Composition
      id="SatelliteBriefingPreview"
      component={SatelliteBriefingExample}
      durationInFrames={SATELLITEBRIEFING_EXAMPLE_SECONDS * preview.fps}
      fps={preview.fps}
      width={preview.width}
      height={preview.height}
    />
    <Composition
      id="SatelliteBriefingFinal"
      component={SatelliteBriefingExample}
      durationInFrames={SATELLITEBRIEFING_EXAMPLE_SECONDS * final.fps}
      fps={final.fps}
      width={final.width}
      height={final.height}
    />
    <Composition id="SatelliteBriefingWidePreview" component={SatelliteBriefingExample} durationInFrames={SATELLITEBRIEFING_EXAMPLE_SECONDS * widePreview.fps} fps={widePreview.fps} width={widePreview.width} height={widePreview.height} />
    <Composition id="SatelliteBriefingWideFinal" component={SatelliteBriefingExample} durationInFrames={SATELLITEBRIEFING_EXAMPLE_SECONDS * wideFinal.fps} fps={wideFinal.fps} width={wideFinal.width} height={wideFinal.height} />

    {/* Style 39: BACKROOMS (Liminal 3D Corridors & 90s Found Footage) */}
    <Composition
      id="BackroomsPreview"
      component={BackroomsExample}
      durationInFrames={BACKROOMS_EXAMPLE_SECONDS * preview.fps}
      fps={preview.fps}
      width={preview.width}
      height={preview.height}
    />
    <Composition
      id="BackroomsFinal"
      component={BackroomsExample}
      durationInFrames={BACKROOMS_EXAMPLE_SECONDS * final.fps}
      fps={final.fps}
      width={final.width}
      height={final.height}
    />
    <Composition id="BackroomsWidePreview" component={BackroomsExample} durationInFrames={BACKROOMS_EXAMPLE_SECONDS * widePreview.fps} fps={widePreview.fps} width={widePreview.width} height={widePreview.height} />
    <Composition id="BackroomsWideFinal" component={BackroomsExample} durationInFrames={BACKROOMS_EXAMPLE_SECONDS * wideFinal.fps} fps={wideFinal.fps} width={wideFinal.width} height={wideFinal.height} />

    {/* Style 40: VISUALINVESTIGATION (Visual Journalism & Forensic Courtroom Desk) */}
    <Composition
      id="VisualInvestigationPreview"
      component={VisualInvestigationExample}
      durationInFrames={VISUALINVESTIGATION_EXAMPLE_SECONDS * preview.fps}
      fps={preview.fps}
      width={preview.width}
      height={preview.height}
    />
    <Composition
      id="VisualInvestigationFinal"
      component={VisualInvestigationExample}
      durationInFrames={VISUALINVESTIGATION_EXAMPLE_SECONDS * final.fps}
      fps={final.fps}
      width={final.width}
      height={final.height}
    />
    <Composition id="VisualInvestigationWidePreview" component={VisualInvestigationExample} durationInFrames={VISUALINVESTIGATION_EXAMPLE_SECONDS * widePreview.fps} fps={widePreview.fps} width={widePreview.width} height={widePreview.height} />
    <Composition id="VisualInvestigationWideFinal" component={VisualInvestigationExample} durationInFrames={VISUALINVESTIGATION_EXAMPLE_SECONDS * wideFinal.fps} fps={wideFinal.fps} width={wideFinal.width} height={wideFinal.height} />

    {/* Style 41: TRADINGTERMINAL (Institutional Financial Markets & Crypto Telemetry) */}
    <Composition
      id="TradingTerminalPreview"
      component={TradingTerminalExample}
      durationInFrames={TRADINGTERMINAL_EXAMPLE_SECONDS * preview.fps}
      fps={preview.fps}
      width={preview.width}
      height={preview.height}
    />
    <Composition
      id="TradingTerminalFinal"
      component={TradingTerminalExample}
      durationInFrames={TRADINGTERMINAL_EXAMPLE_SECONDS * final.fps}
      fps={final.fps}
      width={final.width}
      height={final.height}
    />
    <Composition id="TradingTerminalWidePreview" component={TradingTerminalExample} durationInFrames={TRADINGTERMINAL_EXAMPLE_SECONDS * widePreview.fps} fps={widePreview.fps} width={widePreview.width} height={widePreview.height} />
    <Composition id="TradingTerminalWideFinal" component={TradingTerminalExample} durationInFrames={TRADINGTERMINAL_EXAMPLE_SECONDS * wideFinal.fps} fps={wideFinal.fps} width={wideFinal.width} height={wideFinal.height} />

    {/* Style 42: HISTORYMAP (Geopolitical & War History Documentary Map Director) */}
    <Composition
      id="HistoryMapPreview"
      component={HistoryMapExample}
      durationInFrames={HISTORYMAP_EXAMPLE_SECONDS * preview.fps}
      fps={preview.fps}
      width={preview.width}
      height={preview.height}
    />
    <Composition
      id="HistoryMapFinal"
      component={HistoryMapExample}
      durationInFrames={HISTORYMAP_EXAMPLE_SECONDS * final.fps}
      fps={final.fps}
      width={final.width}
      height={final.height}
    />

    {/* Style 43: ISLAMICDOCUMENTARY (Folk Islam & Islamic Golden Age Motion Director) */}
    <Composition
      id="IslamicDocumentaryPreview"
      component={IslamicDocumentaryExample}
      durationInFrames={ISLAMICDOCUMENTARY_EXAMPLE_SECONDS * preview.fps}
      fps={preview.fps}
      width={preview.width}
      height={preview.height}
    />
    <Composition
      id="IslamicDocumentaryFinal"
      component={IslamicDocumentaryExample}
      durationInFrames={ISLAMICDOCUMENTARY_EXAMPLE_SECONDS * final.fps}
      fps={final.fps}
      width={final.width}
      height={final.height}
    />
    <Composition id="IslamicDocumentaryWidePreview" component={IslamicDocumentaryExample} durationInFrames={ISLAMICDOCUMENTARY_EXAMPLE_SECONDS * widePreview.fps} fps={widePreview.fps} width={widePreview.width} height={widePreview.height} />
    <Composition id="IslamicDocumentaryWideFinal" component={IslamicDocumentaryExample} durationInFrames={ISLAMICDOCUMENTARY_EXAMPLE_SECONDS * wideFinal.fps} fps={wideFinal.fps} width={wideFinal.width} height={wideFinal.height} />

    {/* Style 44: MISTISFORGE (Nusantara Folk Horror & Misty Village Night) */}
    <Composition id="MistisforgePreview" component={MistisforgeExample} durationInFrames={MISTISFORGE_EXAMPLE_SECONDS * preview.fps} fps={preview.fps} width={preview.width} height={preview.height} />
    <Composition id="MistisforgeFinal" component={MistisforgeExample} durationInFrames={MISTISFORGE_EXAMPLE_SECONDS * final.fps} fps={final.fps} width={final.width} height={final.height} />
    <Composition id="MistisforgeWidePreview" component={MistisforgeExample} durationInFrames={MISTISFORGE_EXAMPLE_SECONDS * widePreview.fps} fps={widePreview.fps} width={widePreview.width} height={widePreview.height} />
    <Composition id="MistisforgeWideFinal" component={MistisforgeExample} durationInFrames={MISTISFORGE_EXAMPLE_SECONDS * wideFinal.fps} fps={wideFinal.fps} width={wideFinal.width} height={wideFinal.height} />

    {/* Style 45: FOODFORGE (Macro Food Tabletop & Slow-Motion Culinary Hero) */}
    <Composition id="FoodforgePreview" component={FoodforgeExample} durationInFrames={FOODFORGE_EXAMPLE_SECONDS * preview.fps} fps={preview.fps} width={preview.width} height={preview.height} />
    <Composition id="FoodforgeFinal" component={FoodforgeExample} durationInFrames={FOODFORGE_EXAMPLE_SECONDS * final.fps} fps={final.fps} width={final.width} height={final.height} />
    <Composition id="FoodforgeWidePreview" component={FoodforgeExample} durationInFrames={FOODFORGE_EXAMPLE_SECONDS * widePreview.fps} fps={widePreview.fps} width={widePreview.width} height={widePreview.height} />
    <Composition id="FoodforgeWideFinal" component={FoodforgeExample} durationInFrames={FOODFORGE_EXAMPLE_SECONDS * wideFinal.fps} fps={wideFinal.fps} width={wideFinal.width} height={wideFinal.height} />

    {/* Style 46: TACTICBOARD (3D Football Tactics Board & Match Replay) */}
    <Composition id="TacticboardPreview" component={TacticboardExample} durationInFrames={TACTICBOARD_EXAMPLE_SECONDS * preview.fps} fps={preview.fps} width={preview.width} height={preview.height} />
    <Composition id="TacticboardFinal" component={TacticboardExample} durationInFrames={TACTICBOARD_EXAMPLE_SECONDS * final.fps} fps={final.fps} width={final.width} height={final.height} />
    <Composition id="TacticboardWidePreview" component={TacticboardExample} durationInFrames={TACTICBOARD_EXAMPLE_SECONDS * widePreview.fps} fps={widePreview.fps} width={widePreview.width} height={widePreview.height} />
    <Composition id="TacticboardWideFinal" component={TacticboardExample} durationInFrames={TACTICBOARD_EXAMPLE_SECONDS * wideFinal.fps} fps={wideFinal.fps} width={wideFinal.width} height={wideFinal.height} />

    {/* Style 47: WAYANGFORGE (Wayang Kulit Shadow Puppet Screen & Batik) */}
    <Composition id="WayangforgePreview" component={WayangforgeExample} durationInFrames={WAYANGFORGE_EXAMPLE_SECONDS * preview.fps} fps={preview.fps} width={preview.width} height={preview.height} />
    <Composition id="WayangforgeFinal" component={WayangforgeExample} durationInFrames={WAYANGFORGE_EXAMPLE_SECONDS * final.fps} fps={final.fps} width={final.width} height={final.height} />
    <Composition id="WayangforgeWidePreview" component={WayangforgeExample} durationInFrames={WAYANGFORGE_EXAMPLE_SECONDS * widePreview.fps} fps={widePreview.fps} width={widePreview.width} height={widePreview.height} />
    <Composition id="WayangforgeWideFinal" component={WayangforgeExample} durationInFrames={WAYANGFORGE_EXAMPLE_SECONDS * wideFinal.fps} fps={wideFinal.fps} width={wideFinal.width} height={wideFinal.height} />

    {/* Style 48: DISASTERSIM (Geohazard Cross-Section & Disaster Simulation) */}
    <Composition id="DisastersimPreview" component={DisastersimExample} durationInFrames={DISASTERSIM_EXAMPLE_SECONDS * preview.fps} fps={preview.fps} width={preview.width} height={preview.height} />
    <Composition id="DisastersimFinal" component={DisastersimExample} durationInFrames={DISASTERSIM_EXAMPLE_SECONDS * final.fps} fps={final.fps} width={final.width} height={final.height} />
    <Composition id="DisastersimWidePreview" component={DisastersimExample} durationInFrames={DISASTERSIM_EXAMPLE_SECONDS * widePreview.fps} fps={widePreview.fps} width={widePreview.width} height={widePreview.height} />
    <Composition id="DisastersimWideFinal" component={DisastersimExample} durationInFrames={DISASTERSIM_EXAMPLE_SECONDS * wideFinal.fps} fps={wideFinal.fps} width={wideFinal.width} height={wideFinal.height} />

    {/* Style 49: SCALEFORGE (Extreme Scale Comparison & Continuous Zoom) */}
    <Composition id="ScaleforgePreview" component={ScaleforgeExample} durationInFrames={SCALEFORGE_EXAMPLE_SECONDS * preview.fps} fps={preview.fps} width={preview.width} height={preview.height} />
    <Composition id="ScaleforgeFinal" component={ScaleforgeExample} durationInFrames={SCALEFORGE_EXAMPLE_SECONDS * final.fps} fps={final.fps} width={final.width} height={final.height} />
    <Composition id="ScaleforgeWidePreview" component={ScaleforgeExample} durationInFrames={SCALEFORGE_EXAMPLE_SECONDS * widePreview.fps} fps={widePreview.fps} width={widePreview.width} height={widePreview.height} />
    <Composition id="ScaleforgeWideFinal" component={ScaleforgeExample} durationInFrames={SCALEFORGE_EXAMPLE_SECONDS * wideFinal.fps} fps={wideFinal.fps} width={wideFinal.width} height={wideFinal.height} />

    {/* Style 50: SATISFYFORGE (Oddly Satisfying Loops & Kinetic Sand) */}
    <Composition id="SatisfyforgePreview" component={SatisfyforgeExample} durationInFrames={SATISFYFORGE_EXAMPLE_SECONDS * preview.fps} fps={preview.fps} width={preview.width} height={preview.height} />
    <Composition id="SatisfyforgeFinal" component={SatisfyforgeExample} durationInFrames={SATISFYFORGE_EXAMPLE_SECONDS * final.fps} fps={final.fps} width={final.width} height={final.height} />
    <Composition id="SatisfyforgeWidePreview" component={SatisfyforgeExample} durationInFrames={SATISFYFORGE_EXAMPLE_SECONDS * widePreview.fps} fps={widePreview.fps} width={widePreview.width} height={widePreview.height} />
    <Composition id="SatisfyforgeWideFinal" component={SatisfyforgeExample} durationInFrames={SATISFYFORGE_EXAMPLE_SECONDS * wideFinal.fps} fps={wideFinal.fps} width={wideFinal.width} height={wideFinal.height} />

    {/* Style 51: COMICFORGE (Cel-Shaded Western Comic Book & Halftone) */}
    <Composition id="ComicforgePreview" component={ComicforgeExample} durationInFrames={COMICFORGE_EXAMPLE_SECONDS * preview.fps} fps={preview.fps} width={preview.width} height={preview.height} />
    <Composition id="ComicforgeFinal" component={ComicforgeExample} durationInFrames={COMICFORGE_EXAMPLE_SECONDS * final.fps} fps={final.fps} width={final.width} height={final.height} />
    <Composition id="ComicforgeWidePreview" component={ComicforgeExample} durationInFrames={COMICFORGE_EXAMPLE_SECONDS * widePreview.fps} fps={widePreview.fps} width={widePreview.width} height={widePreview.height} />
    <Composition id="ComicforgeWideFinal" component={ComicforgeExample} durationInFrames={COMICFORGE_EXAMPLE_SECONDS * wideFinal.fps} fps={wideFinal.fps} width={wideFinal.width} height={wideFinal.height} />

    {/* Style 52: ABYSSFORGE (Bioluminescent Deep Sea & Sonar Descent) */}
    <Composition id="AbyssforgePreview" component={AbyssforgeExample} durationInFrames={ABYSSFORGE_EXAMPLE_SECONDS * preview.fps} fps={preview.fps} width={preview.width} height={preview.height} />
    <Composition id="AbyssforgeFinal" component={AbyssforgeExample} durationInFrames={ABYSSFORGE_EXAMPLE_SECONDS * final.fps} fps={final.fps} width={final.width} height={final.height} />
    <Composition id="AbyssforgeWidePreview" component={AbyssforgeExample} durationInFrames={ABYSSFORGE_EXAMPLE_SECONDS * widePreview.fps} fps={widePreview.fps} width={widePreview.width} height={widePreview.height} />
    <Composition id="AbyssforgeWideFinal" component={AbyssforgeExample} durationInFrames={ABYSSFORGE_EXAMPLE_SECONDS * wideFinal.fps} fps={wideFinal.fps} width={wideFinal.width} height={wideFinal.height} />

    {/* Style 53: RISOFORGE (Risograph Zine Print & Spot-Color Halftone) */}
    <Composition id="RisoforgePreview" component={RisoforgeExample} durationInFrames={RISOFORGE_EXAMPLE_SECONDS * preview.fps} fps={preview.fps} width={preview.width} height={preview.height} />
    <Composition id="RisoforgeFinal" component={RisoforgeExample} durationInFrames={RISOFORGE_EXAMPLE_SECONDS * final.fps} fps={final.fps} width={final.width} height={final.height} />
    <Composition id="RisoforgeWidePreview" component={RisoforgeExample} durationInFrames={RISOFORGE_EXAMPLE_SECONDS * widePreview.fps} fps={widePreview.fps} width={widePreview.width} height={widePreview.height} />
    <Composition id="RisoforgeWideFinal" component={RisoforgeExample} durationInFrames={RISOFORGE_EXAMPLE_SECONDS * wideFinal.fps} fps={wideFinal.fps} width={wideFinal.width} height={wideFinal.height} />

    {/* Style 54: Y2KCHROME (Y2K Liquid Chrome & Frutiger Bubble Aesthetic) */}
    <Composition id="Y2kchromePreview" component={Y2kchromeExample} durationInFrames={Y2KCHROME_EXAMPLE_SECONDS * preview.fps} fps={preview.fps} width={preview.width} height={preview.height} />
    <Composition id="Y2kchromeFinal" component={Y2kchromeExample} durationInFrames={Y2KCHROME_EXAMPLE_SECONDS * final.fps} fps={final.fps} width={final.width} height={final.height} />
    <Composition id="Y2kchromeWidePreview" component={Y2kchromeExample} durationInFrames={Y2KCHROME_EXAMPLE_SECONDS * widePreview.fps} fps={widePreview.fps} width={widePreview.width} height={widePreview.height} />
    <Composition id="Y2kchromeWideFinal" component={Y2kchromeExample} durationInFrames={Y2KCHROME_EXAMPLE_SECONDS * wideFinal.fps} fps={wideFinal.fps} width={wideFinal.width} height={wideFinal.height} />

    {/* Style 55: FELTCRAFT (Needle-Felted Wool & Stitched Fabric Diorama) */}
    <Composition id="FeltcraftPreview" component={FeltcraftExample} durationInFrames={FELTCRAFT_EXAMPLE_SECONDS * preview.fps} fps={preview.fps} width={preview.width} height={preview.height} />
    <Composition id="FeltcraftFinal" component={FeltcraftExample} durationInFrames={FELTCRAFT_EXAMPLE_SECONDS * final.fps} fps={final.fps} width={final.width} height={final.height} />
    <Composition id="FeltcraftWidePreview" component={FeltcraftExample} durationInFrames={FELTCRAFT_EXAMPLE_SECONDS * widePreview.fps} fps={widePreview.fps} width={widePreview.width} height={widePreview.height} />
    <Composition id="FeltcraftWideFinal" component={FeltcraftExample} durationInFrames={FELTCRAFT_EXAMPLE_SECONDS * wideFinal.fps} fps={wideFinal.fps} width={wideFinal.width} height={wideFinal.height} />

    {/* Style 56: ANATOMIX (Medical Anatomy Cutaway & Clinical Hologram) */}
    <Composition id="AnatomixPreview" component={AnatomixExample} durationInFrames={ANATOMIX_EXAMPLE_SECONDS * preview.fps} fps={preview.fps} width={preview.width} height={preview.height} />
    <Composition id="AnatomixFinal" component={AnatomixExample} durationInFrames={ANATOMIX_EXAMPLE_SECONDS * final.fps} fps={final.fps} width={final.width} height={final.height} />
    <Composition id="AnatomixWidePreview" component={AnatomixExample} durationInFrames={ANATOMIX_EXAMPLE_SECONDS * widePreview.fps} fps={widePreview.fps} width={widePreview.width} height={widePreview.height} />
    <Composition id="AnatomixWideFinal" component={AnatomixExample} durationInFrames={ANATOMIX_EXAMPLE_SECONDS * wideFinal.fps} fps={wideFinal.fps} width={wideFinal.width} height={wideFinal.height} />

    {/* Style 57: UKIYOFORGE (Ukiyo-e Woodblock Print & Layered Waves) */}
    <Composition id="UkiyoforgePreview" component={UkiyoforgeExample} durationInFrames={UKIYOFORGE_EXAMPLE_SECONDS * preview.fps} fps={preview.fps} width={preview.width} height={preview.height} />
    <Composition id="UkiyoforgeFinal" component={UkiyoforgeExample} durationInFrames={UKIYOFORGE_EXAMPLE_SECONDS * final.fps} fps={final.fps} width={final.width} height={final.height} />
    <Composition id="UkiyoforgeWidePreview" component={UkiyoforgeExample} durationInFrames={UKIYOFORGE_EXAMPLE_SECONDS * widePreview.fps} fps={widePreview.fps} width={widePreview.width} height={widePreview.height} />
    <Composition id="UkiyoforgeWideFinal" component={UkiyoforgeExample} durationInFrames={UKIYOFORGE_EXAMPLE_SECONDS * wideFinal.fps} fps={wideFinal.fps} width={wideFinal.width} height={wideFinal.height} />

    {/* Style 58: STAINEDGLASS (Stained Glass Leadlight & Cathedral Light) */}
    <Composition id="StainedglassPreview" component={StainedglassExample} durationInFrames={STAINEDGLASS_EXAMPLE_SECONDS * preview.fps} fps={preview.fps} width={preview.width} height={preview.height} />
    <Composition id="StainedglassFinal" component={StainedglassExample} durationInFrames={STAINEDGLASS_EXAMPLE_SECONDS * final.fps} fps={final.fps} width={final.width} height={final.height} />
    <Composition id="StainedglassWidePreview" component={StainedglassExample} durationInFrames={STAINEDGLASS_EXAMPLE_SECONDS * widePreview.fps} fps={widePreview.fps} width={widePreview.width} height={widePreview.height} />
    <Composition id="StainedglassWideFinal" component={StainedglassExample} durationInFrames={STAINEDGLASS_EXAMPLE_SECONDS * wideFinal.fps} fps={wideFinal.fps} width={wideFinal.width} height={wideFinal.height} />

    {/* Style 59: SULAMFORGE (Embroidery, Sulam & Woven Tenun Textile) */}
    <Composition id="SulamforgePreview" component={SulamforgeExample} durationInFrames={SULAMFORGE_EXAMPLE_SECONDS * preview.fps} fps={preview.fps} width={preview.width} height={preview.height} />
    <Composition id="SulamforgeFinal" component={SulamforgeExample} durationInFrames={SULAMFORGE_EXAMPLE_SECONDS * final.fps} fps={final.fps} width={final.width} height={final.height} />
    <Composition id="SulamforgeWidePreview" component={SulamforgeExample} durationInFrames={SULAMFORGE_EXAMPLE_SECONDS * widePreview.fps} fps={widePreview.fps} width={widePreview.width} height={widePreview.height} />
    <Composition id="SulamforgeWideFinal" component={SulamforgeExample} durationInFrames={SULAMFORGE_EXAMPLE_SECONDS * wideFinal.fps} fps={wideFinal.fps} width={wideFinal.width} height={wideFinal.height} />

    {/* Style 60: MOSAICFORGE (Tessellated Mosaic Tiles Assembling) */}
    <Composition id="MosaicforgePreview" component={MosaicforgeExample} durationInFrames={MOSAICFORGE_EXAMPLE_SECONDS * preview.fps} fps={preview.fps} width={preview.width} height={preview.height} />
    <Composition id="MosaicforgeFinal" component={MosaicforgeExample} durationInFrames={MOSAICFORGE_EXAMPLE_SECONDS * final.fps} fps={final.fps} width={final.width} height={final.height} />
    <Composition id="MosaicforgeWidePreview" component={MosaicforgeExample} durationInFrames={MOSAICFORGE_EXAMPLE_SECONDS * widePreview.fps} fps={widePreview.fps} width={widePreview.width} height={widePreview.height} />
    <Composition id="MosaicforgeWideFinal" component={MosaicforgeExample} durationInFrames={MOSAICFORGE_EXAMPLE_SECONDS * wideFinal.fps} fps={wideFinal.fps} width={wideFinal.width} height={wideFinal.height} />

    {/* Style 61: MARBLEMUSEUM (Classical Marble Sculpture & Museum Gallery) */}
    <Composition id="MarblemuseumPreview" component={MarblemuseumExample} durationInFrames={MARBLEMUSEUM_EXAMPLE_SECONDS * preview.fps} fps={preview.fps} width={preview.width} height={preview.height} />
    <Composition id="MarblemuseumFinal" component={MarblemuseumExample} durationInFrames={MARBLEMUSEUM_EXAMPLE_SECONDS * final.fps} fps={final.fps} width={final.width} height={final.height} />
    <Composition id="MarblemuseumWidePreview" component={MarblemuseumExample} durationInFrames={MARBLEMUSEUM_EXAMPLE_SECONDS * widePreview.fps} fps={widePreview.fps} width={widePreview.width} height={widePreview.height} />
    <Composition id="MarblemuseumWideFinal" component={MarblemuseumExample} durationInFrames={MARBLEMUSEUM_EXAMPLE_SECONDS * wideFinal.fps} fps={wideFinal.fps} width={wideFinal.width} height={wideFinal.height} />

    {/* Style 62: TERRARIUM (Glass Jar Terrarium Living Ecosystem) */}
    <Composition id="TerrariumPreview" component={TerrariumExample} durationInFrames={TERRARIUM_EXAMPLE_SECONDS * preview.fps} fps={preview.fps} width={preview.width} height={preview.height} />
    <Composition id="TerrariumFinal" component={TerrariumExample} durationInFrames={TERRARIUM_EXAMPLE_SECONDS * final.fps} fps={final.fps} width={final.width} height={final.height} />
    <Composition id="TerrariumWidePreview" component={TerrariumExample} durationInFrames={TERRARIUM_EXAMPLE_SECONDS * widePreview.fps} fps={widePreview.fps} width={widePreview.width} height={widePreview.height} />
    <Composition id="TerrariumWideFinal" component={TerrariumExample} durationInFrames={TERRARIUM_EXAMPLE_SECONDS * wideFinal.fps} fps={wideFinal.fps} width={wideFinal.width} height={wideFinal.height} />

    {/* Style 63: SKETCHFORGE (Pencil Sketch Turning Into 3D Form) */}
    <Composition id="SketchforgePreview" component={SketchforgeExample} durationInFrames={SKETCHFORGE_EXAMPLE_SECONDS * preview.fps} fps={preview.fps} width={preview.width} height={preview.height} />
    <Composition id="SketchforgeFinal" component={SketchforgeExample} durationInFrames={SKETCHFORGE_EXAMPLE_SECONDS * final.fps} fps={final.fps} width={final.width} height={final.height} />
    <Composition id="SketchforgeWidePreview" component={SketchforgeExample} durationInFrames={SKETCHFORGE_EXAMPLE_SECONDS * widePreview.fps} fps={widePreview.fps} width={widePreview.width} height={widePreview.height} />
    <Composition id="SketchforgeWideFinal" component={SketchforgeExample} durationInFrames={SKETCHFORGE_EXAMPLE_SECONDS * wideFinal.fps} fps={wideFinal.fps} width={wideFinal.width} height={wideFinal.height} />

    {/* Style 64: DREAMCORE (Pastel Dreamcore & Impossible Surreal Spaces) */}
    <Composition id="DreamcorePreview" component={DreamcoreExample} durationInFrames={DREAMCORE_EXAMPLE_SECONDS * preview.fps} fps={preview.fps} width={preview.width} height={preview.height} />
    <Composition id="DreamcoreFinal" component={DreamcoreExample} durationInFrames={DREAMCORE_EXAMPLE_SECONDS * final.fps} fps={final.fps} width={final.width} height={final.height} />
    <Composition id="DreamcoreWidePreview" component={DreamcoreExample} durationInFrames={DREAMCORE_EXAMPLE_SECONDS * widePreview.fps} fps={widePreview.fps} width={widePreview.width} height={widePreview.height} />
    <Composition id="DreamcoreWideFinal" component={DreamcoreExample} durationInFrames={DREAMCORE_EXAMPLE_SECONDS * wideFinal.fps} fps={wideFinal.fps} width={wideFinal.width} height={wideFinal.height} />

    {/* Style 65: GACHAREVEAL (Gacha Card & Loot Reveal Spectacle) */}
    <Composition id="GacharevealPreview" component={GacharevealExample} durationInFrames={GACHAREVEAL_EXAMPLE_SECONDS * preview.fps} fps={preview.fps} width={preview.width} height={preview.height} />
    <Composition id="GacharevealFinal" component={GacharevealExample} durationInFrames={GACHAREVEAL_EXAMPLE_SECONDS * final.fps} fps={final.fps} width={final.width} height={final.height} />
    <Composition id="GacharevealWidePreview" component={GacharevealExample} durationInFrames={GACHAREVEAL_EXAMPLE_SECONDS * widePreview.fps} fps={widePreview.fps} width={widePreview.width} height={widePreview.height} />
    <Composition id="GacharevealWideFinal" component={GacharevealExample} durationInFrames={GACHAREVEAL_EXAMPLE_SECONDS * wideFinal.fps} fps={wideFinal.fps} width={wideFinal.width} height={wideFinal.height} />

    {/* Style 66: ARCADECRT (Arcade Cabinet & CRT Scanline Retro Game) */}
    <Composition id="ArcadecrtPreview" component={ArcadecrtExample} durationInFrames={ARCADECRT_EXAMPLE_SECONDS * preview.fps} fps={preview.fps} width={preview.width} height={preview.height} />
    <Composition id="ArcadecrtFinal" component={ArcadecrtExample} durationInFrames={ARCADECRT_EXAMPLE_SECONDS * final.fps} fps={final.fps} width={final.width} height={final.height} />
    <Composition id="ArcadecrtWidePreview" component={ArcadecrtExample} durationInFrames={ARCADECRT_EXAMPLE_SECONDS * widePreview.fps} fps={widePreview.fps} width={widePreview.width} height={widePreview.height} />
    <Composition id="ArcadecrtWideFinal" component={ArcadecrtExample} durationInFrames={ARCADECRT_EXAMPLE_SECONDS * wideFinal.fps} fps={wideFinal.fps} width={wideFinal.width} height={wideFinal.height} />

    {/* Style 67: MANUSCRIPT (Illuminated Manuscript & Lontar Palm-Leaf) */}
    <Composition id="ManuscriptPreview" component={ManuscriptExample} durationInFrames={MANUSCRIPT_EXAMPLE_SECONDS * preview.fps} fps={preview.fps} width={preview.width} height={preview.height} />
    <Composition id="ManuscriptFinal" component={ManuscriptExample} durationInFrames={MANUSCRIPT_EXAMPLE_SECONDS * final.fps} fps={final.fps} width={final.width} height={final.height} />
    <Composition id="ManuscriptWidePreview" component={ManuscriptExample} durationInFrames={MANUSCRIPT_EXAMPLE_SECONDS * widePreview.fps} fps={widePreview.fps} width={widePreview.width} height={widePreview.height} />
    <Composition id="ManuscriptWideFinal" component={ManuscriptExample} durationInFrames={MANUSCRIPT_EXAMPLE_SECONDS * wideFinal.fps} fps={wideFinal.fps} width={wideFinal.width} height={wideFinal.height} />

    {/* Style 68: GLITCHFORGE (Glitch Art, Datamosh & Signal Corruption) */}
    <Composition id="GlitchforgePreview" component={GlitchforgeExample} durationInFrames={GLITCHFORGE_EXAMPLE_SECONDS * preview.fps} fps={preview.fps} width={preview.width} height={preview.height} />
    <Composition id="GlitchforgeFinal" component={GlitchforgeExample} durationInFrames={GLITCHFORGE_EXAMPLE_SECONDS * final.fps} fps={final.fps} width={final.width} height={final.height} />
    <Composition id="GlitchforgeWidePreview" component={GlitchforgeExample} durationInFrames={GLITCHFORGE_EXAMPLE_SECONDS * widePreview.fps} fps={widePreview.fps} width={widePreview.width} height={widePreview.height} />
    <Composition id="GlitchforgeWideFinal" component={GlitchforgeExample} durationInFrames={GLITCHFORGE_EXAMPLE_SECONDS * wideFinal.fps} fps={wideFinal.fps} width={wideFinal.width} height={wideFinal.height} />

    {/* Style 69: CHAINREACTION (Rube Goldberg Tabletop Machine, Cause → Effect) */}
    <Composition id="ChainreactionPreview" component={ChainreactionExample} durationInFrames={CHAINREACTION_EXAMPLE_SECONDS * preview.fps} fps={preview.fps} width={preview.width} height={preview.height} />
    <Composition id="ChainreactionFinal" component={ChainreactionExample} durationInFrames={CHAINREACTION_EXAMPLE_SECONDS * final.fps} fps={final.fps} width={final.width} height={final.height} />
    <Composition id="ChainreactionWidePreview" component={ChainreactionExample} durationInFrames={CHAINREACTION_EXAMPLE_SECONDS * widePreview.fps} fps={widePreview.fps} width={widePreview.width} height={widePreview.height} />
    <Composition id="ChainreactionWideFinal" component={ChainreactionExample} durationInFrames={CHAINREACTION_EXAMPLE_SECONDS * wideFinal.fps} fps={wideFinal.fps} width={wideFinal.width} height={wideFinal.height} />

    {/* Style 70: COLLAGE (Torn Halftone Paper Collage, Ransom-Note Titles) */}
    <Composition id="CollagePreview" component={CollageExample} durationInFrames={COLLAGE_EXAMPLE_SECONDS * preview.fps} fps={preview.fps} width={preview.width} height={preview.height} />
    <Composition id="CollageFinal" component={CollageExample} durationInFrames={COLLAGE_EXAMPLE_SECONDS * final.fps} fps={final.fps} width={final.width} height={final.height} />
    <Composition id="CollageWidePreview" component={CollageExample} durationInFrames={COLLAGE_EXAMPLE_SECONDS * widePreview.fps} fps={widePreview.fps} width={widePreview.width} height={widePreview.height} />
    <Composition id="CollageWideFinal" component={CollageExample} durationInFrames={COLLAGE_EXAMPLE_SECONDS * wideFinal.fps} fps={wideFinal.fps} width={wideFinal.width} height={wideFinal.height} />

    {/* Style 71: FILM16 (16mm Documentary Film Look) */}
    <Composition id="Film16Preview" component={Film16Example} durationInFrames={FILM16_EXAMPLE_SECONDS * preview.fps} fps={preview.fps} width={preview.width} height={preview.height} />
    <Composition id="Film16Final" component={Film16Example} durationInFrames={FILM16_EXAMPLE_SECONDS * final.fps} fps={final.fps} width={final.width} height={final.height} />
    <Composition id="Film16WidePreview" component={Film16Example} durationInFrames={FILM16_EXAMPLE_SECONDS * widePreview.fps} fps={widePreview.fps} width={widePreview.width} height={widePreview.height} />
    <Composition id="Film16WideFinal" component={Film16Example} durationInFrames={FILM16_EXAMPLE_SECONDS * wideFinal.fps} fps={wideFinal.fps} width={wideFinal.width} height={wideFinal.height} />

    {/* Style 72: BATIKFORGE (Batik Tulis: Wax, Indigo Dye, Mega Mendung Lift) */}
    <Composition id="BatikforgePreview" component={BatikforgeExample} durationInFrames={BATIKFORGE_EXAMPLE_SECONDS * preview.fps} fps={preview.fps} width={preview.width} height={preview.height} />
    <Composition id="BatikforgeFinal" component={BatikforgeExample} durationInFrames={BATIKFORGE_EXAMPLE_SECONDS * final.fps} fps={final.fps} width={final.width} height={final.height} />
    <Composition id="BatikforgeWidePreview" component={BatikforgeExample} durationInFrames={BATIKFORGE_EXAMPLE_SECONDS * widePreview.fps} fps={widePreview.fps} width={widePreview.width} height={widePreview.height} />
    <Composition id="BatikforgeWideFinal" component={BatikforgeExample} durationInFrames={BATIKFORGE_EXAMPLE_SECONDS * wideFinal.fps} fps={wideFinal.fps} width={wideFinal.width} height={wideFinal.height} />

    {/* Style 73: INFLATABLE (Glossy Vinyl Inflatable Toys, Balloon Letters) */}
    <Composition id="InflatablePreview" component={InflatableExample} durationInFrames={INFLATABLE_EXAMPLE_SECONDS * preview.fps} fps={preview.fps} width={preview.width} height={preview.height} />
    <Composition id="InflatableFinal" component={InflatableExample} durationInFrames={INFLATABLE_EXAMPLE_SECONDS * final.fps} fps={final.fps} width={final.width} height={final.height} />
    <Composition id="InflatableWidePreview" component={InflatableExample} durationInFrames={INFLATABLE_EXAMPLE_SECONDS * widePreview.fps} fps={widePreview.fps} width={widePreview.width} height={widePreview.height} />
    <Composition id="InflatableWideFinal" component={InflatableExample} durationInFrames={INFLATABLE_EXAMPLE_SECONDS * wideFinal.fps} fps={wideFinal.fps} width={wideFinal.width} height={wideFinal.height} />

    {/* Style 74: UKIRFORGE (Jepara Wood Carving & Wooden Toys) */}
    <Composition id="UkirforgePreview" component={UkirforgeExample} durationInFrames={UKIRFORGE_EXAMPLE_SECONDS * preview.fps} fps={preview.fps} width={preview.width} height={preview.height} />
    <Composition id="UkirforgeFinal" component={UkirforgeExample} durationInFrames={UKIRFORGE_EXAMPLE_SECONDS * final.fps} fps={final.fps} width={final.width} height={final.height} />
    <Composition id="UkirforgeWidePreview" component={UkirforgeExample} durationInFrames={UKIRFORGE_EXAMPLE_SECONDS * widePreview.fps} fps={widePreview.fps} width={widePreview.width} height={widePreview.height} />
    <Composition id="UkirforgeWideFinal" component={UkirforgeExample} durationInFrames={UKIRFORGE_EXAMPLE_SECONDS * wideFinal.fps} fps={wideFinal.fps} width={wideFinal.width} height={wideFinal.height} />

    {/* Style 75: RAJUTFORGE (registered in kits/rajutforge/register.tsx) */}
    <RajutforgeCompositions />

    {/* Style 76: ORIGAMIFORGE (registered in kits/origamiforge/register.tsx) */}
    <OrigamiforgeCompositions />

    {/* Style 77: GERABAHFORGE (registered in kits/gerabahforge/register.tsx) */}
    <GerabahforgeCompositions />

    {/* Style 78: PAINTERLY (registered in kits/painterly/register.tsx) */}
    <PainterlyCompositions />

    {/* Style 79: BRONZEFORGE (registered in kits/bronzeforge/register.tsx) */}
    <BronzeforgeCompositions />

    {/* Style 80: PLUSHFORGE (registered in kits/plushforge/register.tsx) */}
    <PlushforgeCompositions />

    {/* Style 81: PASIRFORGE (registered in kits/pasirforge/register.tsx) */}
    <PasirforgeCompositions />

    {/* Style 82: BROADCASTFORGE (virtual news studio) */}
    <Composition id="BroadcastForgePreview" component={BroadcastForgeExample} durationInFrames={BROADCASTFORGE_EXAMPLE_SECONDS * preview.fps} fps={preview.fps} width={preview.width} height={preview.height} />
    <Composition id="BroadcastForgeFinal" component={BroadcastForgeExample} durationInFrames={BROADCASTFORGE_EXAMPLE_SECONDS * final.fps} fps={final.fps} width={final.width} height={final.height} />
    <Composition id="BroadcastForgeWidePreview" component={BroadcastForgeExample} durationInFrames={BROADCASTFORGE_EXAMPLE_SECONDS * widePreview.fps} fps={widePreview.fps} width={widePreview.width} height={widePreview.height} />
    <Composition id="BroadcastForgeWideFinal" component={BroadcastForgeExample} durationInFrames={BROADCASTFORGE_EXAMPLE_SECONDS * wideFinal.fps} fps={wideFinal.fps} width={wideFinal.width} height={wideFinal.height} />

  </>
);
