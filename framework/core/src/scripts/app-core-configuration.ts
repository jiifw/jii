/**
 * @link https://www.github.com/jiifw
 * @copyright Copyright (c) 2023-2024 Jii framework
 * @license https://www.github.com/jiifw/jii/blob/main/LICENSE
 * @author Junaid Atari <mj.atari@gmail.com>
 * @since 0.0.1
 */

// classes
import Jii from '../Jii';
import Event from '../classes/Event';
import Plugin from '../classes/Plugin';
import Application from '../classes/Application';
import PluginAppEvent from '../classes/PluginAppEvent';
import ConfigurationEvent from '../classes/ConfigurationEvent';
import PluginAppConfigEvent from '../classes/PluginAppConfigEvent';

// utils
import configurationProcessor from './configuration-processor';

// types
import {ApplicationConfig} from '../typings/app-config';

export default async (instance: Application, config: ApplicationConfig): Promise<ApplicationConfig> => {
  let validators: string[] = [
    '@jiiRoot/config/validators/CoreConfigValidator',
    '@jiiRoot/config/validators/SettingsConfigValidator',
    '@jiiRoot/config/validators/AppEventsConfigValidator',
    '@jiiRoot/config/validators/ComponentsConfigValidator',
    '@jiiRoot/config/validators/ModulesConfigValidator',
    ...instance.coreConfigValidators(),
  ];

  // invoke plugins
  await configurationProcessor({
    app: instance, config, validators: ['@jiiRoot/config/validators/PluginsConfigValidator'],
  });

  const pluginCoreConfig = Jii.plugins.pluginsMetadata(
    [], false, (definition, plugin) => (plugin.configValidators())
  );

  validators.push(...Object.values(pluginCoreConfig).map(item => item.custom).flat());
  validators = [...new Set(validators)];

  let pluginEvent = null;

  /////////////// STARTS: PLUGIN EVENT (BEFORE_APP_INIT) TRIGGER //////////////
  pluginEvent = new PluginAppEvent();
  pluginEvent.sender = instance;
  for (const handler of Object.values(Jii.plugins.getPluginsEvent(Plugin.EVENT_BEFORE_APP_INIT))) {
    await Event.triggerHandler(Plugin.EVENT_BEFORE_APP_INIT, handler, {}, pluginEvent);
  }
  /////////////// ENDS: PLUGIN EVENT (BEFORE_APP_INIT) TRIGGER ////////////////

  instance.preInitConfig(config);

  /////////////// STARTS: PLUGIN EVENT (BEFORE_CONFIG_PROCESS) TRIGGER //////////////
  pluginEvent = new PluginAppConfigEvent();
  pluginEvent.sender = instance;
  pluginEvent.config = config;
  for (const handler of Object.values(Jii.plugins.getPluginsEvent(Plugin.EVENT_BEFORE_CONFIG_PROCESS))) {
    await Event.triggerHandler(Plugin.EVENT_BEFORE_CONFIG_PROCESS, handler, {}, pluginEvent);
  }
  config = pluginEvent.config as ApplicationConfig;
  pluginEvent = null;
  /////////////// ENDS: PLUGIN EVENT (BEFORE_CONFIG_PROCESS) TRIGGER ////////////////

  // validates, verify and apply the configuration
  let updatedConfig = await configurationProcessor({
    app: instance, config, validators,
  });

  /////////////// STARTS: PLUGIN EVENT (AFTER_CONFIG_PROCESS) TRIGGER //////////////
  pluginEvent = new PluginAppConfigEvent();
  pluginEvent.sender = instance;
  pluginEvent.config = updatedConfig;
  for (const handler of Object.values(Jii.plugins.getPluginsEvent(Plugin.EVENT_AFTER_CONFIG_PROCESS))) {
    await Event.triggerHandler(Plugin.EVENT_AFTER_CONFIG_PROCESS, handler, {}, pluginEvent);
  }
  updatedConfig = pluginEvent.config as ApplicationConfig;
  pluginEvent = null;
  /////////////// ENDS: PLUGIN EVENT (AFTER_CONFIG_PROCESS) TRIGGER ////////////////

  const event = new ConfigurationEvent();
  event.sender = instance;
  event.config = updatedConfig as ApplicationConfig;

  await instance.trigger(Application.EVENT_BEFORE_FINALIZE_CONFIG, event);

  return event.config;
}
