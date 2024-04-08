import { ComponentRegistration, RemarkPluginFactoryBase } from './FactoryBase';
import { unistVisit } from '../Exports/Unist';
import { MdxJsxElementFactory } from '../NodeFactory/MdxJsxElementFactory';

import type { Plugin } from 'unified';
import type { Root } from 'mdast';

interface ComponentTransform extends ComponentRegistration<string> {
  lang: string;
}

interface Options {
  components: ComponentTransform[];
}

export class RemarkCodeBlockToGlobalComponentPluginFactory extends RemarkPluginFactoryBase {
  constructor(private readonly options: Options) {
    super(options);
  }

  public get remarkPlugin(): Plugin<[unknown], Root> {
    return () => (tree, vfile) => {
      unistVisit(tree, 'code', (code, index = 0, parent) => {
        this.options.components.forEach(
          ({ lang, componentPath, propsProvider, childrenProvider }) => {
            if (code.lang === lang) {
              parent!.children.splice(
                index,
                1,
                // @ts-expect-error
                MdxJsxElementFactory.createMdxJsxFlowElementNode(code.value, {
                  componentPath,
                  propsProvider,
                  childrenProvider,
                }),
              );
            }
          },
        );
      });
    };
  }
}