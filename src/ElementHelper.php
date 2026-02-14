<?php

declare(strict_types=1);

/**
 * CORS GmbH.
 *
 * This source file is available under two different licenses:
 * - GNU General Public License version 3 (GPLv3)
 * - Pimcore Commercial License (PCL)
 * Full copyright and license information is available in
 * LICENSE.md which is distributed with this source code.
 *
 * @copyright  Copyright (c) CORS GmbH (https://www.cors.gmbh)
 * @license    https://www.cors.gmbh/license     GPLv3 and PCL
 */

namespace CORS\Bundle\VarnishBundle;

use FOS\HttpCacheBundle\CacheManager;
use FOS\HttpCacheBundle\Http\SymfonyResponseTagger;
use Pimcore\Model\Asset;
use Pimcore\Model\DataObject;
use Pimcore\Model\Document;
use Pimcore\Model\Element\ElementInterface;
use Pimcore\Model\Element\Service;
use Psr\Log\LoggerInterface;

class ElementHelper
{
    public function __construct(
        protected SymfonyResponseTagger $responseTagger,
        protected CacheManager $cacheManager,
        protected LoggerInterface $logger
    ) {
    }

    public function tagElement(ElementInterface $element)
    {
        $this->responseTagger->addTags($this->getCacheTags($element));
    }

    public function invalidate(ElementInterface|array $element)
    {
        if (is_array($element)) {
            $type = $element['type'] ?? '';
            $id = $element['id'] ?? '';
            if (!$id) {
                $this->logger->error('Invalidation with missing id for type type "' . $type . '" requested');
                return;
            }
            $element = match ($type) {
                'object' => DataObject::getById($id),
                'document' => Document::getById($id),
                'asset' => Asset::getById($id),
                default => null
            };

            if (!$element) {
                $this->logger->error('Invalidation of unknown type "' . $type . '" requested');
                return;
            }
        }
        $this->cacheManager->invalidateTags($this->getCacheTags($element));
        $this->cacheManager->flush();
    }

    protected function getCacheTags(ElementInterface $element)
    {
        $type = Service::getElementType($element);

        return $element->getCacheTags([$type]);
    }
}
