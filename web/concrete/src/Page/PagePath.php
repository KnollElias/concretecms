<?php
namespace Concrete\Core\Page;
use Doctrine\ORM\Mapping as ORM;

/**
 * @ORM\Entity
 * @ORM\Table(name="PagePaths")
 */
class PagePath
{
    /**
     * @ORM\Column(type="text")
     */
    protected $cPath;

    /**
     * @ORM\Id @ORM\Column(type="integer")
     * @ORM\GeneratedValue
     */
    protected $ppID;

    /**
     * @ORM\Column(columnDefinition="integer unsigned")
     * @ORM\GeneratedValue(strategy="IDENTITY")
     */
    protected $cID;

    /**
     * @ORM\Column(type="boolean")
     */
    protected $ppIsCanonical = false;

    /**
     * @ORM\Column(type="boolean")
     */
    protected $ppGeneratedFromURLSlugs = false;

    public function getPagePathID()
    {
        return $this->ppID;
    }

    public function getPagePath()
    {
        return $this->cPath;
    }

    public function setPagePath($path)
    {
        $this->cPath = $path;
    }

    public function setPageObject(Page $c)
    {
        $this->cID = ($c->getCollectionPointerOriginalID() > 0) ? $c->getCollectionPointerOriginalID() : $c->getCollectionID();
    }

    public function setPagePathIsCanonical($ppIsCanonical)
    {
        $this->ppIsCanonical = $ppIsCanonical;
    }

    public function isPagePathCanonical()
    {
        return $this->ppIsCanonical;
    }

    public function setPagePathIsAutoGenerated($ppGeneratedFromURLSlugs)
    {
        $this->ppGeneratedFromURLSlugs = $ppGeneratedFromURLSlugs;
    }

    public function isPagePathAutoGenerated()
    {
        return $this->ppGeneratedFromURLSlugs;
    }

    public function getCollectionID()
    {
        return $this->cID;
    }
}
